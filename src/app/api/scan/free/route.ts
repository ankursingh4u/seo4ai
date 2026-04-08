import { getOpenAI } from '@/lib/openai'
import { analyzeMentions } from '@/lib/analyzer'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Rate limiting: 3 scans per IP per day, 10 min cooldown between scans
const COOLDOWN_MS = 10 * 60 * 1000 // 10 minutes
const DAILY_LIMIT = 3
const rateLimitMap = new Map<string, { lastScan: number; dailyCount: number; dayStart: number }>()

// Global daily budget cap - stop all free scans if exceeded
const DAILY_BUDGET = { count: 0, dayStart: 0, limit: 200 }

function checkRateLimit(ip: string): string | null {
  const now = Date.now()
  const today = Math.floor(now / 86400000)

  // Global budget check
  if (DAILY_BUDGET.dayStart !== today) {
    DAILY_BUDGET.count = 0
    DAILY_BUDGET.dayStart = today
  }
  if (DAILY_BUDGET.count >= DAILY_BUDGET.limit) {
    return 'Free scans are temporarily unavailable. Please sign up for unlimited access.'
  }

  // Per-IP check
  const entry = rateLimitMap.get(ip)
  if (entry) {
    const entryDay = Math.floor(entry.dayStart / 86400000)
    if (entryDay === today) {
      if (entry.dailyCount >= DAILY_LIMIT) {
        return `Daily limit reached (${DAILY_LIMIT} free scans/day). Sign up for more.`
      }
      if (now - entry.lastScan < COOLDOWN_MS) {
        const waitMin = Math.ceil((COOLDOWN_MS - (now - entry.lastScan)) / 60000)
        return `Please wait ${waitMin} minute${waitMin > 1 ? 's' : ''} before scanning again.`
      }
    }
  }

  return null
}

function recordScan(ip: string) {
  const now = Date.now()
  const today = Math.floor(now / 86400000)
  DAILY_BUDGET.count++

  const entry = rateLimitMap.get(ip)
  const entryDay = entry ? Math.floor(entry.dayStart / 86400000) : -1

  if (entry && entryDay === today) {
    entry.lastScan = now
    entry.dailyCount++
  } else {
    rateLimitMap.set(ip, { lastScan: now, dailyCount: 1, dayStart: now })
  }

  // Cleanup old entries every 100 scans
  if (DAILY_BUDGET.count % 100 === 0) {
    const cutoff = now - 86400000
    rateLimitMap.forEach((val, key) => {
      if (val.lastScan < cutoff) rateLimitMap.delete(key)
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { brandName, industry } = await request.json()
    if (!brandName || !industry) {
      return NextResponse.json({ error: 'brandName and industry are required' }, { status: 400 })
    }

    // Validate input lengths
    if (brandName.length > 100 || industry.length > 100) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const rateLimitError = checkRateLimit(ip)
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError }, { status: 429 })
    }

    recordScan(ip)

    // Only 3 quick prompts for free scan (cheaper than 5)
    const prompts = [
      `best ${industry} tools`,
      `what is ${brandName}`,
      `top ${industry} companies`,
    ]

    const results = await Promise.allSettled(
      prompts.map(async (prompt) => {
        const completion = await getOpenAI().chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300, // Reduced from 500
          temperature: 0.7,
        })
        const response = completion.choices[0]?.message?.content || ''
        const analysis = analyzeMentions(response, brandName, [])
        return { prompt, brandMentioned: analysis.brandMentioned }
      })
    )

    const successful = results
      .filter((r): r is PromiseFulfilledResult<{ prompt: string; brandMentioned: boolean }> => r.status === 'fulfilled')
      .map(r => r.value)

    const mentionCount = successful.filter(r => r.brandMentioned).length
    const totalPrompts = successful.length
    const score = totalPrompts > 0 ? Math.round((mentionCount / totalPrompts) * 100) : 0

    return NextResponse.json({
      score,
      mentionCount,
      totalPrompts,
      prompts: successful.map(r => ({ prompt: r.prompt, mentioned: r.brandMentioned })),
      message: mentionCount > 0
        ? `${brandName} was mentioned in ${mentionCount}/${totalPrompts} AI responses. Sign up to get your full visibility report with 20+ prompts.`
        : `${brandName} was NOT mentioned in any AI responses. You're invisible to AI search. Sign up to learn how to fix this.`,
    })
  } catch (error) {
    console.error('Free scan error:', error)
    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 })
  }
}
