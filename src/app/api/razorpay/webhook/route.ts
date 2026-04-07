import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = getServiceClient()

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity
        const notes = subscription.notes || {}

        if (notes.user_id && notes.plan) {
          await supabase
            .from('user_plans')
            .upsert({
              user_id: notes.user_id,
              plan: notes.plan,
              status: 'active',
              stripe_customer_id: subscription.id,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.paused': {
        const subscription = event.payload.subscription.entity
        const { data: userPlan } = await supabase
          .from('user_plans')
          .select('user_id')
          .eq('stripe_customer_id', subscription.id)
          .single()

        if (userPlan) {
          await supabase
            .from('user_plans')
            .update({
              plan: 'starter',
              status: 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userPlan.user_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
