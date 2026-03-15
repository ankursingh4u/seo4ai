import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/stripe'

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

    // Count scans this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: scanCount } = await supabase
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    return NextResponse.json({
      plan,
      status: userPlan?.status || 'active',
      ...planConfig,
      scansUsed: scanCount || 0,
      scansRemaining: Math.max(0, planConfig.scanLimit - (scanCount || 0)),
      canScan: (scanCount || 0) < planConfig.scanLimit,
      canViewCompetitors: plan !== 'starter',
      canViewFixPlan: plan === 'max',
    })
  } catch {
    // If user_plans table doesn't exist, return starter plan
    return NextResponse.json({
      plan: 'starter',
      status: 'active',
      ...PLANS.starter,
      scansUsed: 0,
      scansRemaining: 1,
      canScan: true,
      canViewCompetitors: false,
      canViewFixPlan: false,
    })
  }
}
