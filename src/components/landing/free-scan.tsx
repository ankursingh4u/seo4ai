'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Lock } from 'lucide-react'

/**
 * Landing scan starter. We intentionally do NOT run an anonymous scan here:
 * the real score is gated behind signup (login wall) so every scan maps to a
 * user, and we don't burn model spend on anonymous traffic. The visceral
 * "shock" lives in the static hero mockup; this captures intent and hands the
 * brand/industry to the signup flow to prefill the first real scan.
 */
export function FreeScan() {
  const router = useRouter()
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandName.trim() || !industry.trim()) return
    setSubmitting(true)
    const params = new URLSearchParams({
      brand: brandName.trim(),
      industry: industry.trim(),
    })
    router.push(`/signup?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgba(28,25,23,0.06)]"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Your brand name"
            required
            className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 h-12 text-sm focus-visible:ring-violet-600"
          />
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="What you do (e.g. CRM, pizza, gym)"
            required
            className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 h-12 text-sm focus-visible:ring-violet-600"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-violet-700 hover:bg-violet-800 text-white h-12 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Starting your scan…
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Scan my AI visibility, free
            </>
          )}
        </Button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-500">
          <Lock className="h-3 w-3" />
          Free account · results in ~60s · no card required
        </p>
      </form>
    </div>
  )
}
