import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { industry, region } = await request.json()

    if (!industry) {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 })
    }

    const regionClause = region ? ` in ${region}` : ''
    const prompt = `What are the top 5 most well-known ${industry} brands/companies${regionClause}? Return only the names as a JSON array.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || '[]'

    // Extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/)
    const competitors: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ competitors })
  } catch (error) {
    console.error('Competitor discovery failed:', error)
    return NextResponse.json({ error: 'Failed to discover competitors' }, { status: 500 })
  }
}
