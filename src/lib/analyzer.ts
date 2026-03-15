export interface AnalysisResult {
  brandMentioned: boolean
  brandPosition: number | null
  brandSentiment: 'positive' | 'neutral' | 'negative'
  competitorsMentioned: string[]
  sentimentScore: number
}

export function analyzeMentions(
  response: string,
  brandName: string,
  competitors: string[]
): AnalysisResult {
  const lowerResponse = response.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  // Check if brand is mentioned
  const brandMentioned = lowerResponse.includes(lowerBrand)

  // Find brand position in numbered lists or mentions
  let brandPosition: number | null = null
  if (brandMentioned) {
    const lines = response.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerBrand)) {
        // Check for numbered list pattern
        const match = lines[i].match(/^[\s]*(\d+)[.\):\-]/)
        if (match) {
          brandPosition = parseInt(match[1])
        } else {
          brandPosition = i + 1
        }
        break
      }
    }
  }

  // Check competitor mentions
  const competitorsMentioned = competitors.filter(comp =>
    lowerResponse.includes(comp.toLowerCase())
  )

  // Calculate sentiment score (-10 to 10)
  let sentimentScore = 0
  if (brandMentioned) {
    sentimentScore += 3 // Base points for being mentioned

    // Position bonus
    if (brandPosition !== null) {
      if (brandPosition <= 3) sentimentScore += 4
      else if (brandPosition <= 5) sentimentScore += 2
      else sentimentScore += 1
    }

    // Check for positive language around brand mention
    const positiveTerms = ['best', 'excellent', 'top', 'leading', 'popular', 'recommended', 'powerful', 'innovative', 'great']
    const negativeTerms = ['worst', 'poor', 'bad', 'expensive', 'limited', 'lacking', 'outdated', 'slow']

    const brandContext = extractBrandContext(response, brandName)
    const contextLower = brandContext.toLowerCase()

    positiveTerms.forEach(term => {
      if (contextLower.includes(term)) sentimentScore += 1
    })
    negativeTerms.forEach(term => {
      if (contextLower.includes(term)) sentimentScore -= 2
    })

    sentimentScore = Math.max(-10, Math.min(10, sentimentScore))
  }

  // Determine sentiment category
  let brandSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (sentimentScore > 2) brandSentiment = 'positive'
  else if (sentimentScore < -2) brandSentiment = 'negative'

  return {
    brandMentioned,
    brandPosition,
    brandSentiment,
    competitorsMentioned,
    sentimentScore,
  }
}

function extractBrandContext(response: string, brandName: string): string {
  const index = response.toLowerCase().indexOf(brandName.toLowerCase())
  if (index === -1) return ''
  const start = Math.max(0, index - 100)
  const end = Math.min(response.length, index + brandName.length + 100)
  return response.substring(start, end)
}

interface PromptResultForAnalysis {
  brand_mentioned: boolean
  competitors_mentioned: string[]
  sentiment_score: number
  position: number | null
}

export function calculateVisibilityScore(promptResults: PromptResultForAnalysis[]): number {
  if (promptResults.length === 0) return 0

  const totalPrompts = promptResults.length

  // Mention frequency score (40% weight) - what % of prompts mention the brand
  const mentionCount = promptResults.filter(r => r.brand_mentioned).length
  const mentionFrequencyScore = (mentionCount / totalPrompts) * 100

  // Sentiment score (30% weight) - average sentiment normalized to 0-100
  const avgSentiment = promptResults.reduce((sum, r) => sum + r.sentiment_score, 0) / totalPrompts
  const sentimentScore = ((avgSentiment + 10) / 20) * 100 // Normalize -10..10 to 0..100

  // Position score (30% weight) - how high brand appears when mentioned
  const mentionedResults = promptResults.filter(r => r.brand_mentioned && r.position !== null)
  let positionScore = 0
  if (mentionedResults.length > 0) {
    const avgPosition = mentionedResults.reduce((sum, r) => sum + (r.position || 10), 0) / mentionedResults.length
    positionScore = Math.max(0, (1 - (avgPosition - 1) / 10)) * 100
  }

  const finalScore = Math.round(
    mentionFrequencyScore * 0.4 +
    sentimentScore * 0.3 +
    positionScore * 0.3
  )

  return Math.max(0, Math.min(100, finalScore))
}

export function analyzeCompetitorGaps(
  promptResults: PromptResultForAnalysis[],
  competitors: string[],
  _brandName?: string
): Array<{
  competitorName: string
  mentionCount: number
  gapScore: number
  promptsAppeared: string[]
}> {
  const brandMentionCount = promptResults.filter(r => r.brand_mentioned).length

  return competitors.map(competitor => {
    const competitorResults = promptResults.filter(r =>
      r.competitors_mentioned.some(c => c.toLowerCase() === competitor.toLowerCase())
    )
    const mentionCount = competitorResults.length
    const gapScore = mentionCount - brandMentionCount

    return {
      competitorName: competitor,
      mentionCount,
      gapScore,
      promptsAppeared: [], // Will be populated with actual prompts in the API route
    }
  })
}

export function findPromptOpportunities(
  promptResults: Array<PromptResultForAnalysis & { prompt: string }>,
  _brandName?: string
): Array<{
  prompt: string
  competitorsFound: string[]
  opportunityScore: number
  searchIntent: string
}> {
  return promptResults
    .filter(r => !r.brand_mentioned && r.competitors_mentioned.length > 0)
    .map(r => {
      const intentWeight = r.prompt.toLowerCase().includes('best') ? 2 : 1
      const opportunityScore = Math.min(100, r.competitors_mentioned.length * 20 * intentWeight)

      const lowerPrompt = r.prompt.toLowerCase()
      let searchIntent = 'general'
      if (lowerPrompt.includes('alternative') || lowerPrompt.includes('vs')) searchIntent = 'comparison'
      else if (lowerPrompt.includes('best') || lowerPrompt.includes('top')) searchIntent = 'recommendation'
      else if (lowerPrompt.includes('review')) searchIntent = 'evaluation'

      return {
        prompt: r.prompt,
        competitorsFound: r.competitors_mentioned,
        opportunityScore,
        searchIntent,
      }
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
}
