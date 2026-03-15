import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { generatePrompts } from '@/lib/prompts'
import { analyzeMentions, calculateVisibilityScore, analyzeCompetitorGaps, findPromptOpportunities } from '@/lib/analyzer'
import { sendEmail, scanCompleteEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

async function queryAI(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  })
  return completion.choices[0]?.message?.content || ''
}

async function processBatch<T>(items: T[], batchSize: number, processor: (item: T) => Promise<unknown>) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(batch.map(processor))
    results.push(...batchResults)
  }
  return results
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scanId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get scan and brand details
    const { data: scan } = await supabase
      .from('scans')
      .select('*, brands!inner(*)')
      .eq('id', scanId)
      .single()

    if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 })

    const brand = scan.brands as unknown as {
      brand_name: string
      industry: string
      competitors: string[]
      website: string | null
      market_region?: { type: string; country?: string; state?: string; city?: string }
    }

    // Update scan status to running
    await supabase.from('scans').update({ status: 'running' }).eq('id', scanId)

    // Generate prompts with region context
    const prompts = generatePrompts(brand.industry, brand.brand_name, brand.competitors, brand.market_region as import('@/lib/prompts').MarketRegion | undefined)

    // Process prompts in batches of 5 for faster execution
    const promptResultsData: Array<{
      scan_id: string
      prompt: string
      ai_model: string
      ai_response: string
      brand_mentioned: boolean
      brand_sentiment: string
      competitors_mentioned: string[]
      sentiment_score: number
      position: number | null
    }> = []

    await processBatch(prompts, 5, async (prompt) => {
      try {
        const aiResponse = await queryAI(prompt)
        const analysis = analyzeMentions(aiResponse, brand.brand_name, brand.competitors)

        promptResultsData.push({
          scan_id: scanId,
          prompt,
          ai_model: 'gpt-4o-mini',
          ai_response: aiResponse,
          brand_mentioned: analysis.brandMentioned,
          brand_sentiment: analysis.brandSentiment,
          competitors_mentioned: analysis.competitorsMentioned,
          sentiment_score: analysis.sentimentScore,
          position: analysis.brandPosition,
        })
      } catch (err) {
        console.error(`Failed to process prompt: ${prompt}`, err)
        promptResultsData.push({
          scan_id: scanId,
          prompt,
          ai_model: 'gpt-4o-mini',
          ai_response: 'Error: Failed to get AI response',
          brand_mentioned: false,
          brand_sentiment: 'neutral',
          competitors_mentioned: [],
          sentiment_score: 0,
          position: null,
        })
      }
    })

    // Store prompt results
    if (promptResultsData.length > 0) {
      await supabase.from('prompt_results').insert(promptResultsData)
    }

    // Calculate visibility score
    const visibilityScore = calculateVisibilityScore(promptResultsData)
    const mentionCount = promptResultsData.filter(r => r.brand_mentioned).length
    const competitorMentionCount = promptResultsData.reduce(
      (sum, r) => sum + r.competitors_mentioned.length, 0
    )

    // Analyze competitor gaps
    const gaps = analyzeCompetitorGaps(promptResultsData, brand.competitors, brand.brand_name)
    const competitorAnalysisData = gaps.map(gap => ({
      scan_id: scanId,
      competitor_name: gap.competitorName,
      mention_count: gap.mentionCount,
      gap_score: gap.gapScore,
      prompts_appeared: promptResultsData
        .filter(r => r.competitors_mentioned.some(c => c.toLowerCase() === gap.competitorName.toLowerCase()))
        .map(r => r.prompt),
    }))

    if (competitorAnalysisData.length > 0) {
      await supabase.from('competitor_analysis').insert(competitorAnalysisData)
    }

    // Find prompt opportunities
    const opportunities = findPromptOpportunities(
      promptResultsData.map(r => ({ ...r, prompt: r.prompt })),
      brand.brand_name
    )
    const opportunityData = opportunities.map(opp => ({
      scan_id: scanId,
      prompt: opp.prompt,
      competitors_found: opp.competitorsFound,
      opportunity_score: opp.opportunityScore,
      search_intent: opp.searchIntent,
    }))

    if (opportunityData.length > 0) {
      await supabase.from('prompt_opportunities').insert(opportunityData)
    }

    // Update scan with results
    await supabase.from('scans').update({
      status: 'completed',
      visibility_score: visibilityScore,
      mention_count: mentionCount,
      competitor_mention_count: competitorMentionCount,
    }).eq('id', scanId)

    // Send scan complete email notification
    try {
      if (user.email) {
        const email = scanCompleteEmail(
          brand.brand_name,
          visibilityScore,
          mentionCount,
          opportunities.length
        )
        await sendEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
        })
      }
    } catch (emailError) {
      console.error('Failed to send scan complete email:', emailError)
    }

    return NextResponse.json({
      scanId,
      visibilityScore,
      mentionCount,
      competitorMentionCount,
      promptsProcessed: promptResultsData.length,
      opportunitiesFound: opportunities.length,
    })
  } catch (error) {
    const { id: scanId } = await params
    const supabase = await createClient()
    await supabase.from('scans').update({ status: 'failed' }).eq('id', scanId)
    console.error('Scan execution failed:', error)
    return NextResponse.json({ error: 'Scan execution failed' }, { status: 500 })
  }
}
