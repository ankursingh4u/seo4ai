import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brandId = request.nextUrl.searchParams.get('brandId')

    let query = supabase
      .from('scans')
      .select('*, brands!inner(user_id, brand_name)')
      .order('scan_date', { ascending: false })

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    const { data, error } = await query
    if (error) {
      console.error('GET /api/scans error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/scans error:', error)
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { brandId } = await request.json()
    if (!brandId) return NextResponse.json({ error: 'brandId is required' }, { status: 400 })

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const { data: scan, error } = await supabase
      .from('scans')
      .insert({ brand_id: brandId, status: 'pending' })
      .select()
      .single()

    if (error) {
      console.error('POST /api/scans error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(scan, { status: 201 })
  } catch (error) {
    console.error('POST /api/scans error:', error)
    return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
  }
}
