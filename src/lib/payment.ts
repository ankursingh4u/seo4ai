import Razorpay from 'razorpay'

let _razorpay: Razorpay | null = null

export function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _razorpay
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceINR: 0,
    planId: '',
    scanLimit: 1,
    brandLimit: 1,
    features: ['1 scan/month', 'Visibility score', 'Region targeting'],
    lockedFeatures: ['Competitor scores', 'Fix Plan', 'Bonus tips'],
  },
  pro: {
    name: 'Pro',
    price: 9,
    priceINR: 749,
    planId: process.env.RAZORPAY_PRO_PLAN_ID || '',
    scanLimit: 4,
    brandLimit: 3,
    features: ['Weekly scans', 'Competitor gap scores', 'Region targeting', 'Progress history'],
    lockedFeatures: ['Fix Plan', 'Bonus tips'],
  },
  max: {
    name: 'Max',
    price: 29,
    priceINR: 2499,
    planId: process.env.RAZORPAY_MAX_PLAN_ID || '',
    scanLimit: 30,
    brandLimit: 10,
    features: ['Daily scans', 'Competitor scores', 'AI Fix Plan', 'Bonus tips', 'Export reports', 'Priority support'],
    lockedFeatures: [],
  },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanByRazorpayPlanId(planId: string): PlanType {
  if (planId === PLANS.pro.planId) return 'pro'
  if (planId === PLANS.max.planId) return 'max'
  return 'starter'
}
