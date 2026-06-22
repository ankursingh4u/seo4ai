import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'SEO4AI refund policy, all sales are final.',
}

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">Refund Policy</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: June 22, 2026</p>

      {/* Prominent no-refund notice */}
      <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-stone-800">
          <strong>All sales are final. SEO4AI does not offer refunds.</strong> By purchasing a plan
          you acknowledge and accept this policy.
        </p>
      </div>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-stone-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 [&_h2]:mt-8 [&_h2]:mb-1">
        <h2>1. No refunds</h2>
        <p>
          All payments made to SEO4AI are <strong>non-refundable</strong>. We do not provide refunds,
          credits, or pro-rated returns for any reason, including but not limited to: unused time on a
          subscription, features you did not use, dissatisfaction with AI-generated results,
          downgrading or cancelling your plan, or accidental purchases.
        </p>

        <h2>2. Try before you buy</h2>
        <p>
          Because all sales are final, we offer a <strong>free plan</strong> so you can fully evaluate
          SEO4AI before paying. Please use it to confirm the Service meets your needs before
          subscribing to a paid plan.
        </p>

        <h2>3. Cancellations</h2>
        <p>
          You can cancel your subscription at any time from your billing settings. Cancellation stops
          future charges. Your plan stays active until the end of the current billing period, there
          is <strong>no refund</strong> for the remainder of that period.
        </p>

        <h2>4. No guarantee of results</h2>
        <p>
          SEO4AI provides tools, measurements, and recommendations. AI visibility depends on factors
          outside our control, and we do not guarantee any specific outcome. A lack of results is not
          grounds for a refund.
        </p>

        <h2>5. Chargebacks</h2>
        <p>
          Initiating a chargeback or payment dispute instead of contacting us may result in immediate
          suspension of your account. If you have a billing concern, please reach out first.
        </p>

        <h2>6. Exceptions</h2>
        <p>
          The only exception is where a refund is <strong>strictly required by applicable law</strong>.
          Nothing in this policy limits rights that cannot be waived under the law that applies to you.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about billing? Email{' '}
          <a href="mailto:support@seo4ai.app" className="text-violet-700 underline">support@seo4ai.app</a>.{' '}
          Note that, per this policy, payments are non-refundable.
        </p>
      </div>
    </div>
  )
}
