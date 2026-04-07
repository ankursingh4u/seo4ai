import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/payment'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Try to get user plan, default to starter
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const plan = (userPlan?.plan as keyof typeof PLANS) || 'starter'
    const planConfig = PLANS[plan] || PLANS.starter

    // Count scans this month for THIS USER's brands only
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: userBrands } = await supabase
      .from('brands')
      .select('id')

    const brandIds = (userBrands || []).map(b => b.id)
    let scanCount = 0

    if (brandIds.length > 0) {
      const { count } = await supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .in('brand_id', brandIds)
        .gte('created_at', startOfMonth.toISOString())
      scanCount = count || 0
    }

    return NextResponse.json({
      plan,
      status: userPlan?.status || 'active',
      ...planConfig,
      brandsUsed: brandIds.length,
      scansUsed: scanCount,
      scansRemaining: Math.max(0, planConfig.scanLimit - scanCount),
      canScan: scanCount < planConfig.scanLimit,
      canAddBrand: brandIds.length < planConfig.brandLimit,
      canViewCompetitors: plan !== 'starter',
      canViewFixPlan: plan === 'max',
    })
  } catch {
    return NextResponse.json({
      plan: 'starter',
      status: 'active',
      ...PLANS.starter,
      brandsUsed: 0,
      scansUsed: 0,
      scansRemaining: 1,
      canScan: true,
      canAddBrand: true,
      canViewCompetitors: false,
      canViewFixPlan: false,
    })
  }
}
