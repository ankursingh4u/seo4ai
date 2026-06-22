import { getOpenAI } from '@/lib/openai'
import { analyzeMentions, type AnalysisResult } from '@/lib/analyzer'

// Which AI engines each plan scans against.
//   Free  → ChatGPT
//   Pro   → ChatGPT + Gemini
//   Max   → ChatGPT + Gemini + Claude (Claude auto-skips if no valid key)
export type EngineKey = 'openai' | 'gemini' | 'claude'

export function getScanEngines(plan: string): EngineKey[] {
  if (plan === 'max') return ['openai', 'gemini', 'claude']
  if (plan === 'pro') return ['openai', 'gemini']
  return ['openai']
}

const ENGINE_LABEL: Record<EngineKey, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  claude: 'Claude',
}

async function queryOpenAI(prompt: string): Promise<string> {
  const c = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7,
  })
  return c.choices[0]?.message?.content || ''
}

async function queryGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const d = await res.json()
  return (d.candidates?.[0]?.content?.parts || [])
    .map((p: { text?: string }) => p.text || '')
    .join('')
}

async function queryClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY not set')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const d = await res.json()
  return (d.content || []).map((b: { text?: string }) => b.text || '').join('')
}

const QUERY: Record<EngineKey, (p: string) => Promise<string>> = {
  openai: queryOpenAI,
  gemini: queryGemini,
  claude: queryClaude,
}

export interface MultiEngineResult {
  aiModel: string // engines that actually responded (comma-joined)
  aiResponse: string // combined responses, labeled per engine
  analysis: AnalysisResult
}

/**
 * Query all enabled engines for a prompt and aggregate into one result:
 * the brand counts as mentioned if ANY engine names it; competitors are the
 * union; sentiment/position take the best across engines. Engines that error
 * (e.g. missing/invalid key, quota) are skipped gracefully.
 */
export async function queryEnginesAndAnalyze(
  prompt: string,
  engineKeys: EngineKey[],
  brandName: string,
  competitors: string[]
): Promise<MultiEngineResult> {
  const settled = await Promise.allSettled(
    engineKeys.map(async (k) => ({ key: k, text: await QUERY[k](prompt) }))
  )
  const ok = settled.filter(
    (s): s is PromiseFulfilledResult<{ key: EngineKey; text: string }> =>
      s.status === 'fulfilled' && !!s.value.text
  )

  if (ok.length === 0) {
    return {
      aiModel: 'none',
      aiResponse: 'Error: no engine responded',
      analysis: analyzeMentions('', brandName, competitors),
    }
  }

  const perEngine = ok.map((s) => ({
    key: s.value.key,
    text: s.value.text,
    a: analyzeMentions(s.value.text, brandName, competitors),
  }))

  const brandMentioned = perEngine.some((e) => e.a.brandMentioned)
  const competitorsMentioned = Array.from(
    new Set(perEngine.flatMap((e) => e.a.competitorsMentioned))
  )
  const mentioned = perEngine.filter((e) => e.a.brandMentioned)
  const sentimentScore = mentioned.length ? Math.max(...mentioned.map((e) => e.a.sentimentScore)) : 0
  const positions = mentioned
    .map((e) => e.a.brandPosition)
    .filter((p): p is number => p !== null)
  const brandPosition = positions.length ? Math.min(...positions) : null
  const brandSentiment: AnalysisResult['brandSentiment'] =
    sentimentScore > 2 ? 'positive' : sentimentScore < -2 ? 'negative' : 'neutral'

  return {
    aiModel: ok.map((s) => s.value.key).join(','),
    aiResponse: perEngine.map((e) => `[${ENGINE_LABEL[e.key]}]\n${e.text}`).join('\n\n'),
    analysis: { brandMentioned, brandPosition, brandSentiment, competitorsMentioned, sentimentScore },
  }
}
