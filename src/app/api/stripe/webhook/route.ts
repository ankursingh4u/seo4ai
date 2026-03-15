import { stripe, getPlanByPriceId } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Use service role client to bypass RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan

      if (userId && plan) {
        // Update user's plan in a user_plans table or metadata
        const { error } = await supabase
          .from('user_plans')
          .upsert({
            user_id: userId,
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })

        if (error) console.error('Failed to update plan:', error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const priceId = subscription.items.data[0]?.price.id
      const plan = getPlanByPriceId(priceId)

      // Find user by stripe customer id
      const { data: userPlan } = await supabase
        .from('user_plans')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single()

      if (userPlan) {
        await supabase
          .from('user_plans')
          .update({
            plan,
            status: subscription.status === 'active' ? 'active' : 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userPlan.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const { data: userPlan } = await supabase
        .from('user_plans')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single()

      if (userPlan) {
        await supabase
          .from('user_plans')
          .update({
            plan: 'starter',
            status: 'inactive',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userPlan.user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
