import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Light per-IP throttle to stop obvious abuse of the public register endpoint.
// (Not a security boundary — just a speed bump; resets per serverless instance.)
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 8
const hits = new Map<string, { count: number; windowStart: number }>()

function throttled(ip: string): boolean {
  const now = Date.now()
  const e = hits.get(ip)
  if (!e || now - e.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return false
  }
  e.count++
  return e.count > MAX_PER_WINDOW
}

/**
 * Registration that auto-confirms the user with the service-role key, so NO
 * confirmation email is sent — which means Supabase's tiny built-in email
 * rate limit never applies. The user can sign in immediately after.
 *
 * Trade-off: emails aren't verified at signup. Acceptable for launch; can be
 * tightened later (e.g. verify-on-first-action) once custom SMTP is wired.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (throttled(ip)) {
      return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again later.' }, { status: 429 })
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // auto-verify → no confirmation email → no rate limit
    })

    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Try signing in instead.' },
          { status: 409 }
        )
      }
      if (msg.includes('password')) {
        return NextResponse.json({ error: 'Password is too weak. Use at least 8 characters.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Sign-up failed.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Sign-up failed. Please try again.' }, { status: 500 })
  }
}
