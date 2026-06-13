import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import type { Subscription } from '@polar-sh/sdk/models/components/subscription.js'
import { getPlanByPolarProductId } from '@/lib/payment'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Resolve our Supabase user id from a subscription: prefer metadata we set at
// checkout, fall back to the external customer id we attached to the customer.
function resolveUserId(sub: Subscription): string | null {
  const fromMeta = sub.metadata?.user_id
  if (typeof fromMeta === 'string' && fromMeta) return fromMeta
  return sub.customer?.externalId || null
}

type PlanStatus = 'active' | 'inactive' | 'past_due'

function mapStatus(status: string): PlanStatus {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due') return 'past_due'
  return 'inactive'
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  if (!process.env.POLAR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event
  try {
    event = validateEvent(body, headers, process.env.POLAR_WEBHOOK_SECRET)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    // Subscription started / renewed / changed — sync plan + status.
    case 'subscription.created':
    case 'subscription.active':
    case 'subscription.updated':
    case 'subscription.uncanceled':
    case 'subscription.canceled': {
      const sub = event.data
      const userId = resolveUserId(sub)
      const plan = getPlanByPolarProductId(sub.productId)

      if (userId) {
        // Only write columns the app actually relies on (plan + status). The
        // portal resolves customers by externalCustomerId and gating reads
        // plan/status, so polar_customer_id / polar_subscription_id are not
        // required for billing to function — kept out so this works whether or
        // not the add_polar_billing.sql migration has run.
        await supabase.from('user_plans').upsert({
          user_id: userId,
          plan,
          status: mapStatus(sub.status),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
      break
    }

    // Access actually revoked (expired or fully canceled) — drop to starter.
    case 'subscription.revoked': {
      const sub = event.data
      const userId = resolveUserId(sub)

      if (userId) {
        await supabase.from('user_plans').update({
          plan: 'starter',
          status: 'inactive',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
