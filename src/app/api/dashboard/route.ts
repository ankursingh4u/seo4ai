import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
          .limit(5),
        supabase
          .from('recommendations')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('impact_score', { ascending: false }),
      ])

      competitorAnalysis = compResult.data
      promptOpportunities = oppResult.data
      recommendations = recResult.data
    }

    return NextResponse.json({
      brands,
      selectedBrand,
      latestScan,
      totalPrompts,
      scanHistory: scanHistory || [],
      competitorAnalysis: competitorAnalysis || [],
      promptOpportunities: promptOpportunities || [],
      recommendations: recommendations || [],
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
