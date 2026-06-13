import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // origin comes from the request URL itself — which is whatever was in the email link.
  // In dev the email link is http://localhost:3000/auth/callback?code=...
  // In prod the email link is https://yourdomain.com/auth/callback?code=...
  // So this always redirects to the correct host automatically, no env vars needed.
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const msg = errorDescription || error
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    if (!sessionError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    const msg = sessionError.message || 'Confirmation failed. Please try again.'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid confirmation link. Please sign up again.')}`)
}
