import { Polar } from '@polar-sh/sdk'

// ── Billing mode switch ──────────────────────────────────────────────
// Flip ONE env var to switch test ↔ real billing: POLAR_SERVER=sandbox|production
// Each mode reads its own credentials so both can live side by side:
//   sandbox    → POLAR_SANDBOX_*       (test card 4242…, no real charges)
//   production → POLAR_PRODUCTION_*     (real money)
// Falls back to the generic POLAR_* vars if a mode-specific one isn't set.
export type PolarMode = 'sandbox' | 'production'

export function getPolarMode(): PolarMode {
  return process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production'
}

function modeEnv(name: string): string {
  const prefix = getPolarMode() === 'sandbox' ? 'POLAR_SANDBOX_' : 'POLAR_PRODUCTION_'
  return process.env[`${prefix}${name}`] || process.env[`POLAR_${name}`] || ''
}

export function getPolarAccessToken() {
  return modeEnv('ACCESS_TOKEN')
}

export function getPolarWebhookSecret() {
  return modeEnv('WEBHOOK_SECRET')
}

export function getProductId(plan: 'pro' | 'max'): string {
  return modeEnv(plan === 'pro' ? 'PRO_PRODUCT_ID' : 'MAX_PRODUCT_ID')
}

let _polar: Polar | null = null

export function getPolar() {
  if (!_polar) {
    _polar = new Polar({
      accessToken: getPolarAccessToken(),
      server: getPolarMode(),
    })
  }
  return _polar
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    scanLimit: 3,
    brandLimit: 1,
    features: ['3 scans/month', 'AI Visibility Score', 'Missed searches', 'Region targeting'],
    lockedFeatures: ['Competitor scores', 'AI Fix Plan', 'Boost content'],
  },
  pro: {
    name: 'Pro',
    price: 9,
    scanLimit: 15,
    brandLimit: 3,
    features: ['15 scans/month', '3 brands', 'Competitor gap scores', 'Progress history', 'Region targeting'],
    lockedFeatures: ['AI Fix Plan', 'Boost content'],
  },
  max: {
    name: 'Max',
    price: 29,
    scanLimit: 60,
    brandLimit: 10,
    features: ['60 scans/month', '10 brands', 'Competitor scores', 'AI Fix Plan', 'Boost content generator', 'Export reports', 'Priority support'],
    lockedFeatures: [],
  },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanByPolarProductId(productId: string | null | undefined): PlanType {
  if (!productId) return 'starter'
  if (productId === getProductId('pro')) return 'pro'
  if (productId === getProductId('max')) return 'max'
  return 'starter'
}
