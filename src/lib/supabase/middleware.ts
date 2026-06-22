import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options: _options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() is a network call to Supabase that runs on EVERY request. If it
  // ever hangs, the edge function times out (504) and the page appears "stuck".
  // Guard it with a timeout: if auth is slow, let the request through and let the
  // page/API (which do their own auth check) handle it — never block on it.
  let user = null
  let authTimedOut = false
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<'TIMEOUT'>((resolve) => setTimeout(() => resolve('TIMEOUT'), 3000)),
    ])
    if (result === 'TIMEOUT') authTimedOut = true
    else user = result.data.user
  } catch {
    // Network/auth error — treat as unknown, don't hard-fail the request.
    authTimedOut = true
  }

  // Only apply redirects when we actually know the auth state.
  if (!authTimedOut) {
    // Protect dashboard routes
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
