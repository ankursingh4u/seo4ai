import { Polar } from '@polar-sh/sdk'

let _polar: Polar | null = null

export function getPolar() {
  if (!_polar) {
    _polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      // 'sandbox' for testing, 'production' for live. Defaults to production.
      server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'production',
    })
  }
  return _polar
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    productId: '',
    scanLimit: 3,
    brandLimit: 1,
    features: ['3 scans/month', 'AI Visibility Score', 'Missed searches', 'Region targeting'],
    lockedFeatures: ['Competitor scores', 'AI Fix Plan', 'Boost content'],
  },
  pro: {
    name: 'Pro',
    price: 9,
    productId: process.env.POLAR_PRO_PRODUCT_ID || '',
    scanLimit: 15,
    brandLimit: 3,
    features: ['15 scans/month', '3 brands', 'Competitor gap scores', 'Progress history', 'Region targeting'],
    lockedFeatures: ['AI Fix Plan', 'Boost content'],
  },
  max: {
    name: 'Max',
    price: 29,
    productId: process.env.POLAR_MAX_PRODUCT_ID || '',
    scanLimit: 60,
    brandLimit: 10,
    features: ['60 scans/month', '10 brands', 'Competitor scores', 'AI Fix Plan', 'Boost content generator', 'Export reports', 'Priority support'],
    lockedFeatures: [],
  },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanByPolarProductId(productId: string | null | undefined): PlanType {
  if (!productId) return 'starter'
  if (productId === PLANS.pro.productId) return 'pro'
  if (productId === PLANS.max.productId) return 'max'
  return 'starter'
}
