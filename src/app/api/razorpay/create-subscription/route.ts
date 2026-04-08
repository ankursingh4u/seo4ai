import { createClient } from '@/lib/supabase/server'
import { getRazorpay, PLANS } from '@/lib/payment'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json()
    if (!plan || !['pro', 'max'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLANS[plan as 'pro' | 'max']

    if (!planConfig.planId) {
      return NextResponse.json({
        error: 'Razorpay plan not configured. Set RAZORPAY_PRO_PLAN_ID and RAZORPAY_MAX_PLAN_ID in env vars.',
      }, { status: 500 })
    }

    // Create a Razorpay subscription
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: planConfig.planId,
      total_count: 12, // 12 months billing cycle
      quantity: 1,
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        plan,
      },
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: planConfig.priceINR * 100, // in paise
      currency: 'INR',
      name: 'AuraRank',
      description: `AuraRank ${planConfig.name} Plan`,
      prefill: {
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Razorpay create subscription error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
