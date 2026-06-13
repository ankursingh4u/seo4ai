'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Lock, AlertTriangle, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'

interface BrandRow {
  id: string
  brand_name: string
  auto_scan?: 'off' | 'weekly' | 'daily'
}

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [plan, setPlan] = useState<'starter' | 'pro' | 'max'>('starter')
  const [savingBrandId, setSavingBrandId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || '')
    })
    fetch('/api/user/plan').then(r => r.ok ? r.json() : null).then(d => { if (d?.plan) setPlan(d.plan) }).catch(() => {})
    fetch('/api/brands').then(r => r.ok ? r.json() : []).then(d => { if (Array.isArray(d)) setBrands(d) }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAutoScanChange(brandId: string, value: 'off' | 'weekly' | 'daily') {
    setSavingBrandId(brandId)
    const prev = brands
    setBrands(bs => bs.map(b => b.id === brandId ? { ...b, auto_scan: value } : b))
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoScan: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      toast.success(value === 'off' ? 'Auto-scan disabled' : `Auto-scan set to ${value}`)
    } catch (err) {
      setBrands(prev)
      toast.error(err instanceof Error ? err.message : 'Failed to update auto-scan')
    } finally {
      setSavingBrandId(null)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  async function handleDeleteAccount() {
    toast.error('Please contact support to delete your account')
    setDeleteDialogOpen(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Profile */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input value={email} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button type="submit" disabled={changingPassword} className="bg-indigo-600 hover:bg-indigo-700">
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Automation — Scheduled Auto-Scans */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> Scheduled Auto-Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Automatically re-scan your brands and get a digest email with your score change,
            new opportunities, and competitor movement.
            {plan === 'starter' && (
              <span className="block mt-2 text-amber-400">
                Scheduled scans require the Pro (weekly) or Max (daily) plan.
              </span>
            )}
            {plan === 'pro' && (
              <span className="block mt-2 text-slate-500">Weekly scans on Pro. Upgrade to Max for daily.</span>
            )}
          </p>
          {brands.length === 0 ? (
            <p className="text-sm text-slate-500">Add a brand first to enable auto-scans.</p>
          ) : (
            <div className="space-y-2">
              {brands.map(b => (
                <div key={b.id} className="flex items-center justify-between gap-3 bg-slate-800/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-200 truncate">{b.brand_name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {savingBrandId === b.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    <select
                      value={b.auto_scan || 'off'}
                      disabled={plan === 'starter' || savingBrandId === b.id}
                      onChange={(e) => handleAutoScanChange(b.id, e.target.value as 'off' | 'weekly' | 'daily')}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md px-2 py-1.5 disabled:opacity-50 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="off">Off</option>
                      <option value="weekly" disabled={plan === 'starter'}>Weekly</option>
                      <option value="daily" disabled={plan !== 'max'}>Daily (Max)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-slate-900/50 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-lg text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              Delete Account
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-red-400">Delete Account</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-400">
                This will permanently delete your account, all brands, scans, and data.
                Type <span className="text-white font-mono">DELETE</span> to confirm.
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}
                  className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
