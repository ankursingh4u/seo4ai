export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options)

  if (res.status === 401) {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Not authenticated')
  }

  return res
}
