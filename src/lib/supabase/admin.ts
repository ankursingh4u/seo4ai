import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | null = null

// Service-role client that bypasses RLS. Use ONLY in trusted server contexts
// (cron jobs, webhooks). Never expose to the browser.
export function createAdminClient(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase admin credentials')
    }
    _admin = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _admin
}
