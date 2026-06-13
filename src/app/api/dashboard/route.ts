import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Static industry benchmarks (avg score, top-10% threshold)
// Updated as real data accumulates — currently based on typical AI visibility ranges
function getIndustryBenchmark(industry: string): { avg: number; top10: number } {
  const lower = industry.toLowerCase()
  if (/restaurant|food|dining|cafe|bakery|catering/.test(lower)) return { avg: 42, top10: 74 }
  if (/hotel|travel|hospitality|resort|lodging/.test(lower)) return { avg: 38, top10: 70 }
  if (/saas|software|tech|devtools|analytics|cybersecurity|ai|platform|cloud|api/.test(lower)) return { avg: 35, top10: 72 }
  if (/retail|e-commerce|ecommerce|shop/.test(lower)) return { avg: 40, top10: 73 }
  if (/health|fitness|wellness|medical/.test(lower)) return { avg: 30, top10: 65 }
  return { avg: 33, top10: 68 }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brandId = request.nextUrl.searchParams.get('brandId')

    // Get user's brands
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false })

    if (!brands || brands.length === 0) {
      return NextResponse.json({ brands: [], hasNoBrands: true })
    }

    const selectedBrandId = brandId || brands[0].id
    const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

    // Get latest scan
    const { data: latestScan } = await supabase
      .from('scans')
      .select('*')
      .eq('brand_id', selectedBrand.id)
      .eq('status', 'completed')
      .order('scan_date', { ascending: false })
      .limit(1)
      .single()

    // Get scan history for chart (last 10)
    const { data: scanHistory } = await supabase
      .from('scans')
      .select('scan_date, visibility_score, mention_count, competitor_mention_count')
      .eq('brand_id', selectedBrand.id)
      .eq('status', 'completed')
      .order('scan_date', { ascending: true })
      .limit(10)

    let competitorAnalysis = null
    let promptOpportunities = null
    let recommendations = null
    let totalPrompts = 0
    const competitorAlerts: string[] = []

    if (latestScan) {
      // Competitor movement vs the previous completed scan
      const { data: prevScan } = await supabase
        .from('scans')
        .select('id')
        .eq('brand_id', selectedBrand.id)
        .eq('status', 'completed')
        .neq('id', latestScan.id)
        .order('scan_date', { ascending: false })
        .limit(1)
        .single()

      if (prevScan) {
        const [{ data: nowComp }, { data: prevComp }] = await Promise.all([
          supabase.from('competitor_analysis').select('competitor_name, mention_count').eq('scan_id', latestScan.id),
          supabase.from('competitor_analysis').select('competitor_name, mention_count').eq('scan_id', prevScan.id),
        ])
        const prevMap = new Map((prevComp || []).map((c: { competitor_name: string; mention_count: number }) => [c.competitor_name, c.mention_count]))
        for (const c of (nowComp || []) as Array<{ competitor_name: string; mention_count: number }>) {
          const before = prevMap.get(c.competitor_name) ?? 0
          const jump = c.mention_count - before
          if (jump >= 2) {
            competitorAlerts.push(`${c.competitor_name} is now appearing in ${jump} more AI searches than your last scan (${before} → ${c.mention_count}).`)
          }
        }
      }
    }

    if (latestScan) {
      const { count } = await supabase
        .from('prompt_results')
        .select('id', { count: 'exact', head: true })
        .eq('scan_id', latestScan.id)
      totalPrompts = count || 0

      const [compResult, oppResult, recResult] = await Promise.all([
        supabase
          .from('competitor_analysis')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('mention_count', { ascending: false }),
        supabase
          .from('prompt_opportunities')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('opportunity_score', { ascending: false })
          .limit(8),
        supabase
          .from('recommendations')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('impact_score', { ascending: false }),
      ])

      competitorAnalysis = compResult.data
      promptOpportunities = oppResult.data
      recommendations = recResult.data

      // Attach AI responses to opportunities for the Response Viewer
      if (promptOpportunities && promptOpportunities.length > 0) {
        const oppPrompts = promptOpportunities.map((o: { prompt: string }) => o.prompt)
        const { data: promptResultRows } = await supabase
          .from('prompt_results')
          .select('prompt, ai_response')
          .eq('scan_id', latestScan.id)
          .in('prompt', oppPrompts)

        if (promptResultRows) {
          const responseMap = new Map(promptResultRows.map(r => [r.prompt, r.ai_response]))
          promptOpportunities = promptOpportunities.map((opp: { prompt: string }) => ({
            ...opp,
            ai_response: responseMap.get(opp.prompt) || null,
          }))
        }
      }
    }

    const industryBenchmark = getIndustryBenchmark(selectedBrand.industry || '')

    return NextResponse.json({
      brands,
      selectedBrand,
      latestScan,
      totalPrompts,
      scanHistory: scanHistory || [],
      competitorAnalysis: competitorAnalysis || [],
      promptOpportunities: promptOpportunities || [],
      recommendations: recommendations || [],
      industryBenchmark,
      competitorAlerts,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
