import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Publish an article to the user's OWN WordPress site via the WordPress REST API
 * using an Application Password. This costs us nothing — it hits the user's site,
 * not any paid AI API. We never store the credentials; they're used once to post.
 *
 * The user creates an Application Password at:
 *   WordPress admin → Users → Profile → Application Passwords
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    if ((userPlan?.plan || 'starter') !== 'max') {
      return NextResponse.json({ error: 'Upgrade to Max plan to publish.' }, { status: 403 })
    }

    const { siteUrl, username, appPassword, title, contentHtml, excerpt, status } = await request.json()

    if (!siteUrl || !username || !appPassword || !title || !contentHtml) {
      return NextResponse.json({ error: 'siteUrl, username, appPassword, title and content are required' }, { status: 400 })
    }

    // Normalize the site URL → https, no trailing slash.
    let base = String(siteUrl).trim().replace(/\/+$/, '')
    if (!/^https?:\/\//i.test(base)) base = `https://${base}`
    base = base.replace(/^http:\/\//i, 'https://')

    const endpoint = `${base}/wp-json/wp/v2/posts`
    // Application passwords are sent as Basic auth. WP allows spaces in the
    // generated password; strip them as WP itself does.
    const token = Buffer.from(`${username}:${String(appPassword).replace(/\s+/g, '')}`).toString('base64')

    const postStatus = status === 'publish' ? 'publish' : 'draft'

    let wpRes: Response
    try {
      wpRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: contentHtml,
          excerpt: excerpt || '',
          status: postStatus,
        }),
      })
    } catch {
      return NextResponse.json(
        { error: `Could not reach ${base}. Check the site URL and that the WordPress REST API is enabled.` },
        { status: 502 }
      )
    }

    if (!wpRes.ok) {
      let detail = ''
      try {
        const err = await wpRes.json()
        detail = err?.message || ''
      } catch { /* non-JSON error body */ }
      if (wpRes.status === 401 || wpRes.status === 403) {
        return NextResponse.json(
          { error: 'WordPress rejected the login. Check the username and Application Password (not your normal password).' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: detail || `WordPress returned an error (${wpRes.status}).` },
        { status: 502 }
      )
    }

    const post = await wpRes.json()
    return NextResponse.json({
      id: post.id,
      link: post.link,
      status: post.status,
    })
  } catch (error) {
    console.error('WordPress publish error:', error)
    return NextResponse.json({ error: 'Failed to publish to WordPress' }, { status: 500 })
  }
}
