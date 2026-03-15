import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 60 ? 'text-emerald-400' : score >= 30 ? 'text-amber-400' : 'text-red-400'
  const borderColor = score >= 60 ? 'border-emerald-500/30' : score >= 30 ? 'border-amber-500/30' : 'border-red-500/30'
  const bgColor = score >= 60 ? 'bg-emerald-500/10' : score >= 30 ? 'bg-amber-500/10' : 'bg-red-500/10'
  const label = score >= 60 ? 'Strong' : score >= 30 ? 'Moderate' : 'Low'

  return (
    <div className={`inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 ${borderColor} ${bgColor}`}>
      <span className={`text-5xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-slate-400 mt-1">{label} Visibility</span>
    </div>
  )
}

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Decode the base64url token to get scanId
  let scanId: string
  try {
    scanId = Buffer.from(token, 'base64url').toString('utf-8')
  } catch {
    notFound()
  }

  if (!scanId) notFound()

  // Use service role client to fetch data (public page, no auth)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )

  // Fetch scan with brand info
  const { data: scan } = await supabase
    .from('scans')
    .select('id, visibility_score, mention_count, competitor_mention_count, scan_date, brand_id')
    .eq('id', scanId)
    .eq('status', 'completed')
    .single()

  if (!scan) notFound()

  // Fetch brand info
  const { data: brand } = await supabase
    .from('brands')
    .select('brand_name, industry')
    .eq('id', scan.brand_id)
    .single()

  if (!brand) notFound()

  // Fetch competitor analysis
  const { data: competitors } = await supabase
    .from('competitor_analysis')
    .select('competitor_name, mention_count, gap_score')
    .eq('scan_id', scanId)
    .order('mention_count', { ascending: false })

  // Fetch opportunity count
  const { count: opportunityCount } = await supabase
    .from('prompt_opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('scan_id', scanId)

  const scanDate = new Date(scan.scan_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AuraRank
          </Link>
          <p className="text-xs text-slate-500 mt-1">AI Visibility Report</p>
        </div>

        {/* Brand Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">{brand.brand_name}</h1>
          <p className="text-slate-400 text-sm">{brand.industry}</p>
          <p className="text-slate-600 text-xs mt-2">Scanned on {scanDate}</p>
        </div>

        {/* Score */}
        <div className="text-center mb-10">
          <ScoreCircle score={scan.visibility_score} />
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{scan.mention_count}</p>
              <p className="text-slate-500 text-xs">AI Mentions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{scan.competitor_mention_count}</p>
              <p className="text-slate-500 text-xs">Competitor Mentions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{opportunityCount || 0}</p>
              <p className="text-slate-500 text-xs">Opportunities</p>
            </div>
          </div>
        </div>

        {/* Competitor Comparison */}
        {competitors && competitors.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Competitor Comparison</h2>
            <div className="space-y-3">
              {/* Brand's own mentions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium text-white">{brand.brand_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (scan.mention_count / Math.max(scan.mention_count, scan.competitor_mention_count, 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{scan.mention_count}</span>
                </div>
              </div>
              {/* Competitors */}
              {competitors.map((comp) => (
                <div key={comp.competitor_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                    <span className="text-sm text-slate-300">{comp.competitor_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-slate-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (comp.mention_count / Math.max(scan.mention_count, scan.competitor_mention_count, 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{comp.mention_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities found */}
        {(opportunityCount || 0) > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-10 text-center">
            <p className="text-amber-400 font-semibold text-lg">{opportunityCount} Opportunities Found</p>
            <p className="text-slate-400 text-sm mt-1">
              There are {opportunityCount} prompts where competitors appear but {brand.brand_name} doesn&apos;t.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mb-12">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-base"
          >
            Check your brand&apos;s AI visibility
          </Link>
          <p className="text-slate-600 text-xs mt-3">Free scan - no credit card required</p>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-800 pt-6">
          <p className="text-slate-600 text-xs">
            Powered by{' '}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              AuraRank
            </Link>
            {' '}&mdash; AI Visibility Intelligence
          </p>
        </div>
      </div>
    </div>
  )
}
