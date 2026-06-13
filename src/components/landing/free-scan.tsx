'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search, CheckCircle2, XCircle, ArrowRight, AlertTriangle, TrendingUp } from 'lucide-react'

interface FreeScanResult {
  score: number
  mentionCount: number
  totalPrompts: number
  prompts: Array<{ prompt: string; mentioned: boolean }>
  message: string
}

export function FreeScan() {
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<FreeScanResult | null>(null)
  const [error, setError] = useState('')

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!brandName.trim() || !industry.trim()) return
    setScanning(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/scan/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: brandName.trim(), industry: industry.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }
      setResult(await res.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  if (result) {
    const missed = result.totalPrompts - result.mentionCount
    const isInvisible = result.mentionCount === 0
    const isStrong = result.mentionCount === result.totalPrompts

    return (
      <Card className="bg-slate-900/80 border-slate-800 max-w-lg mx-auto text-left">
        <CardContent className="pt-5 pb-5">
          {/* Score headline */}
          <div className={`rounded-lg p-4 mb-4 text-center ${
            isStrong ? 'bg-emerald-500/10 border border-emerald-500/20' :
            isInvisible ? 'bg-red-500/10 border border-red-500/20' :
            'bg-amber-500/10 border border-amber-500/20'
          }`}>
            {isInvisible ? (
              <>
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-red-400 mb-1">{brandName} is invisible to AI</p>
                <p className="text-sm text-slate-400">
                  We tested {result.totalPrompts} questions customers ask AI — your brand wasn&apos;t mentioned once.
                  Those customers are being sent to your competitors.
                </p>
              </>
            ) : isStrong ? (
              <>
                <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-emerald-400 mb-1">{brandName} has good AI visibility!</p>
                <p className="text-sm text-slate-400">
                  Mentioned in all {result.totalPrompts} test questions. Sign up for a full 20-prompt report to get your complete score.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-amber-400">{result.mentionCount}/{result.totalPrompts}</p>
                </div>
                <p className="text-base font-semibold text-white mb-1">AI mentioned {brandName} in {result.mentionCount} out of {result.totalPrompts} questions</p>
                <p className="text-sm text-slate-400">
                  That means <span className="text-red-400 font-medium">{missed} out of {result.totalPrompts}</span> potential customers asking AI about {industry} are not hearing about you.
                </p>
              </>
            )}
          </div>

          {/* Prompt breakdown */}
          <div className="space-y-2 mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">What we tested:</p>
            {result.prompts.map((p, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-sm ${p.mentioned ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                {p.mentioned
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs truncate">When someone asked: <span className="text-slate-100">&ldquo;{p.prompt}&rdquo;</span></p>
                  <p className={`text-[10px] mt-0.5 ${p.mentioned ? 'text-emerald-500' : 'text-red-400'}`}>
                    {p.mentioned ? `AI mentioned ${brandName}` : `${brandName} was not mentioned`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4 text-center">
            <p className="text-xs text-slate-300 mb-0.5 font-medium">This was just 3 test questions.</p>
            <p className="text-[11px] text-slate-500">Sign up for a full report: 20+ questions, competitor comparison, and a step-by-step fix plan.</p>
          </div>

          <Link href="/signup" className="block">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10">
              Get Full Report — It&apos;s Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <button onClick={() => { setResult(null); setBrandName(''); setIndustry('') }}
            className="w-full text-xs text-slate-600 hover:text-slate-400 mt-3 transition-colors">
            Check a different brand
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/80 border-slate-800 max-w-lg mx-auto">
      <CardContent className="pt-5 pb-5">
        <form onSubmit={handleScan} className="space-y-3">
          <div>
            <Input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Your brand name (e.g. Salty Sea Kitchen)"
              required
              className="bg-slate-800 border-slate-700 text-white h-11 text-sm"
            />
          </div>
          <div>
            <Input
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="What do you do? (e.g. Restaurant, SaaS, Hotel, Gym)"
              required
              className="bg-slate-800 border-slate-700 text-white h-11 text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={scanning} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Checking AI models...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check If AI Recommends Me
              </>
            )}
          </Button>

          <p className="text-[10px] text-slate-600 text-center">
            No account needed. We test 3 sample questions — takes ~5 seconds.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
