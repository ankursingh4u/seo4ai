'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Crown, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface PlanInfo {
  plan: string
  price: number
  scansUsed: number
  scansRemaining: number
  scanLimit: number
  canScan: boolean
  canViewCompetitors: boolean
  canViewFixPlan: boolean
}

const PLAN_DETAILS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 0,
    priceLabel: 'Free',
    icon: Zap,
    color: 'text-slate-400',
    borderColor: 'border-slate-800',
    features: [
      { text: '1 brand', included: true },
      { text: '1 scan per month', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: false },
      { text: 'AI Fix Plan', included: false },
      { text: 'Bonus optimization tips', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 9,
    priceLabel: '$9',
    icon: Crown,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/50',
    popular: true,
    features: [
      { text: '3 brands', included: true },
      { text: 'Weekly scans (4/month)', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: true },
      { text: 'Progress history', included: true },
      { text: 'AI Fix Plan', included: false },
      { text: 'Bonus optimization tips', included: false },
    ],
  },
  {
    key: 'max',
    name: 'Max',
    price: 29,
    priceLabel: '$29',
    icon: Sparkles,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    features: [
      { text: '10 brands', included: true },
      { text: 'Daily scans (30/month)', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: true },
      { text: 'Progress history', included: true },
      { text: 'AI Fix Plan — how to improve', included: true },
      { text: 'Bonus tips — content ideas, SEO actions', included: true },
      { text: 'Export reports', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

export default function BillingPage() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/user/plan')
      if (res.ok) setPlanInfo(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpgrade(plan: string) {
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Load Razorpay checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: data.razorpayKeyId,
          subscription_id: data.subscriptionId,
          name: 'AuraRank',
          description: data.description,
          prefill: data.prefill,
          theme: { color: '#6366f1' },
          handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
            // Verify payment
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, plan }),
            })
            if (verifyRes.ok) {
              toast.success('Plan upgraded successfully!')
              window.location.reload()
            } else {
              toast.error('Payment verification failed')
            }
          },
          modal: {
            ondismiss: () => setCheckoutLoading(null),
          },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
      setCheckoutLoading(null)
    }
  }

  async function handleManage() {
    toast.info('To manage your subscription, please contact support at support@bolddev.live')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-slate-800/50 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const currentPlan = planInfo?.plan || 'starter'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Billing & Plans</h1>
        <p className="text-slate-400 text-sm mt-1">
          Current plan: <Badge className="bg-indigo-500/20 text-indigo-400 ml-1">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Badge>
          {planInfo && (
            <span className="ml-3 text-slate-500">
              {planInfo.scansUsed}/{planInfo.scanLimit} scans used this month
            </span>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        {PLAN_DETAILS.map(plan => {
          const isCurrent = currentPlan === plan.key
          const isDowngrade = (currentPlan === 'max' && plan.key !== 'max') || (currentPlan === 'pro' && plan.key === 'starter')
          const isUpgrade = !isCurrent && !isDowngrade

          return (
            <Card key={plan.key} className={`bg-slate-900/50 flex flex-col ${isCurrent ? 'ring-2 ring-indigo-500/50' : ''} ${plan.borderColor}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <plan.icon className={`h-4 w-4 ${plan.color}`} />
                    {plan.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px]">Current</Badge>
                  )}
                  {plan.popular && !isCurrent && (
                    <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 text-[10px]">Popular</Badge>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{(plan as any).priceLabel || `₹${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-slate-500 text-sm">/mo</span>}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? 'text-slate-300' : 'text-slate-600'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  currentPlan !== 'starter' ? (
                    <Button variant="outline" className="w-full border-slate-700 text-slate-400 h-8 text-xs" onClick={handleManage}>
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full border-slate-700 text-slate-500 h-8 text-xs">
                      Free Plan
                    </Button>
                  )
                ) : isUpgrade ? (
                  <Button
                    className={`w-full h-8 text-xs ${plan.key === 'max' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={checkoutLoading === plan.key}
                  >
                    {checkoutLoading === plan.key ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Upgrade to {plan.name}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full border-slate-700 text-slate-400 h-8 text-xs" onClick={handleManage}>
                    Switch Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
