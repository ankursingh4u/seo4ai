import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    scanLimit: 1,
    brandLimit: 1,
    features: ['1 scan/month', 'Visibility score', 'Region targeting'],
    lockedFeatures: ['Competitor scores', 'Fix Plan', 'Bonus tips'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 29,
    scanLimit: 4,
    brandLimit: 3,
    features: ['Weekly scans', 'Competitor gap scores', 'Region targeting', 'Progress history'],
    lockedFeatures: ['Fix Plan', 'Bonus tips'],
  },
  max: {
    name: 'Max',
    priceId: process.env.STRIPE_MAX_PRICE_ID || '',
    price: 79,
    scanLimit: 30,
    brandLimit: 10,
    features: ['Daily scans', 'Competitor scores', 'AI Fix Plan', 'Bonus tips', 'Export reports', 'Priority support'],
    lockedFeatures: [],
  },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanType {
  if (priceId === PLANS.pro.priceId) return 'pro'
  if (priceId === PLANS.max.priceId) return 'max'
  return 'starter'
}
