import { createClient } from '@/lib/supabase/server'
import { getPolar, PLANS } from '@/lib/payment'
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
    if (!planConfig.productId) {
      return NextResponse.json({ error: 'Polar product not configured. Set POLAR_PRO_PRODUCT_ID and POLAR_MAX_PRODUCT_ID in env vars.' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkout = await getPolar().checkouts.create({
      products: [planConfig.productId],
      successUrl: `${appUrl}/dashboard/billing?success=true&checkout_id={CHECKOUT_ID}`,
      customerEmail: user.email!,
      // Tie the Polar customer to our Supabase user so the portal + webhooks
      // can resolve the user without storing a Polar customer id first.
      externalCustomerId: user.id,
      metadata: { user_id: user.id, plan },
    })

    return NextResponse.json({ checkoutUrl: checkout.url })
  } catch (error) {
    console.error('Polar checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
