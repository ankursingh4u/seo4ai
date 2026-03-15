'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

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
    const scoreColor = result.score >= 60 ? 'text-emerald-400' : result.score >= 30 ? 'text-amber-400' : 'text-red-400'
    return (
      <Card className="bg-slate-900/80 border-slate-800 max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">AI Visibility Score</p>
            <p className={`text-5xl font-bold ${scoreColor}`}>{result.score}</p>
            <p className="text-xs text-slate-500 mt-1">out of 100</p>
          </div>

          <div className="space-y-2 mb-4">
            {result.prompts.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {p.mentioned
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className="text-slate-300 text-xs truncate">&ldquo;{p.prompt}&rdquo;</span>
                <Badge className={`ml-auto text-[9px] shrink-0 ${p.mentioned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {p.mentioned ? 'Found' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mb-4">{result.message}</p>

          <Link href="/signup" className="block">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Get Full Report <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <button onClick={() => { setResult(null); setBrandName(''); setIndustry('') }}
            className="w-full text-xs text-slate-500 hover:text-slate-300 mt-3 transition-colors">
            Scan another brand
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/80 border-slate-800 max-w-lg mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleScan} className="space-y-3">
          <div>
            <Input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Your brand name (e.g. AuraRank)"
              required
              className="bg-slate-800 border-slate-700 text-white h-10"
            />
          </div>
          <div>
            <Input
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="Industry (e.g. AI SEO, Restaurant, Hotel)"
              required
              className="bg-slate-800 border-slate-700 text-white h-10"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <Button type="submit" disabled={scanning} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Scanning AI models...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Free AI Visibility Check
              </>
            )}
          </Button>

          <p className="text-[10px] text-slate-600 text-center">No account needed. 3 free checks per day.</p>
        </form>
      </CardContent>
    </Card>
  )
}
