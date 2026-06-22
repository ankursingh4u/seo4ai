'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Crown, Zap, Sparkles, ExternalLink } from 'lucide-react'
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
    color: 'text-stone-500',
    borderColor: 'border-stone-200',
    features: [
      { text: '1 brand', included: true },
      { text: '3 scans per month', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: false },
      { text: 'AI Fix Plan', included: false },
      { text: 'Boost content generator', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 9,
    priceLabel: '$9',
    icon: Crown,
    color: 'text-violet-700',
    borderColor: 'border-violet-600/50',
    popular: true,
    features: [
      { text: '3 brands', included: true },
      { text: '15 scans per month', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: true },
      { text: 'Progress history', included: true },
      { text: 'AI Fix Plan', included: false },
      { text: 'Boost content generator', included: false },
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
      { text: '60 scans per month', included: true },
      { text: 'AI Visibility Score', included: true },
      { text: 'Region targeting', included: true },
      { text: 'Competitor gap scores', included: true },
      { text: 'Progress history', included: true },
      { text: 'AI Fix Plan', included: true },
      { text: 'Boost content generator', included: true },
      { text: 'Export reports', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

function BillingContent() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/user/plan')
      if (res.ok) setPlanInfo(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Plan upgraded successfully! It may take a moment to activate.')
    }
  }, [searchParams])

  async function handleUpgrade(plan: string) {
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.checkoutUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
      setCheckoutLoading(null)
    }
  }

  async function handleManage() {
    try {
      const res = await fetch('/api/polar/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.portalUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-stone-100 rounded animate-pulse" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const currentPlan = planInfo?.plan || 'starter'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Billing & Plans</h1>
        <p className="text-stone-500 text-sm mt-1">
          Current plan: <Badge className="bg-violet-500/20 text-violet-700 ml-1">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Badge>
          {planInfo && (
            <span className="ml-3 text-stone-500">
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
          // Already has a paid subscription → plan changes must go through the
          // Polar customer portal (creating a 2nd checkout errors with
          // "You already have an active subscription"). Only brand-new
          // (starter) users go through checkout.
          const isSubscribed = currentPlan !== 'starter'

          return (
            <Card key={plan.key} className={`bg-white flex flex-col ${isCurrent ? 'ring-2 ring-violet-600/50' : ''} ${plan.borderColor}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <plan.icon className={`h-4 w-4 ${plan.color}`} />
                    {plan.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px]">Current</Badge>
                  )}
                  {'popular' in plan && plan.popular && !isCurrent && (
                    <Badge className="bg-violet-700/20 text-violet-700 border-violet-500/30 text-[10px]">Popular</Badge>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{plan.priceLabel}</span>
                  {plan.price > 0 && <span className="text-stone-500 text-sm">/mo</span>}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? 'text-stone-700' : 'text-stone-400'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  isSubscribed ? (
                    <Button variant="outline" className="w-full border-stone-200 text-stone-500 h-8 text-xs" onClick={handleManage}>
                      <ExternalLink className="h-3 w-3 mr-1" /> Manage Subscription
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full border-stone-200 text-stone-500 h-8 text-xs">
                      Free Plan
                    </Button>
                  )
                ) : isSubscribed ? (
                  // Existing subscriber switching plans → portal (handles proration)
                  <Button variant="outline" className="w-full border-stone-200 text-stone-700 hover:bg-stone-100 h-8 text-xs" onClick={handleManage}>
                    <ExternalLink className="h-3 w-3 mr-1" /> {isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                  </Button>
                ) : (
                  // Brand-new (starter) user → checkout
                  <Button
                    className={`w-full h-8 text-xs ${plan.key === 'max' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-700 hover:bg-violet-800'} text-white`}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={checkoutLoading === plan.key}
                  >
                    {checkoutLoading === plan.key ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Upgrade to {plan.name}
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

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="h-8 w-32 bg-stone-100 rounded animate-pulse" />}>
      <BillingContent />
    </Suspense>
  )
}
