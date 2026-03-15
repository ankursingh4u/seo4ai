'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Eye, Scan, Target, Lightbulb, Plus, Loader2, X, TrendingUp,
  MapPin, Globe, ChevronDown, ChevronRight, CheckCircle2, Circle, Sparkles,
  Share2, Link as LinkIcon, Twitter
} from 'lucide-react'

const INDUSTRIES = [
  'AI SEO', 'SaaS', 'Marketing', 'E-commerce', 'Fintech', 'EdTech',
  'HealthTech', 'Restaurant', 'Hotel', 'Real Estate', 'Fitness',
  'DevTools', 'Analytics', 'Cybersecurity', 'Retail', 'Travel',
]

interface DashboardData {
  brands: Array<{ id: string; brand_name: string; industry: string; competitors: string[]; website: string | null; market_region?: { type: string; country?: string; state?: string; city?: string } }>
  selectedBrand: { id: string; brand_name: string; industry: string; competitors: string[]; market_region?: { type: string; country?: string; state?: string; city?: string } } | null
  latestScan: { id: string; visibility_score: number; mention_count: number; competitor_mention_count: number; scan_date: string } | null
  scanHistory: Array<{ scan_date: string; visibility_score: number; mention_count: number; competitor_mention_count: number }>
  competitorAnalysis: Array<{ competitor_name: string; mention_count: number; gap_score: number }>
  promptOpportunities: Array<{ id: string; prompt: string; competitors_found: string[]; opportunity_score: number }>
  recommendations: Array<{ id: string; task_title: string; task_description: string | null; priority: string; impact_score: number; difficulty: string; completed: boolean; category: string }>
  hasNoBrands?: boolean
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [generatingFix, setGeneratingFix] = useState(false)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [savingBrand, setSavingBrand] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [showOpportunities, setShowOpportunities] = useState(false)
  const [showFixPlan, setShowFixPlan] = useState(false)
  const [userPlan, setUserPlan] = useState<{ plan: string; canScan: boolean; canViewCompetitors: boolean; canViewFixPlan: boolean; scansUsed: number; scanLimit: number } | null>(null)
  const [discoveringComps, setDiscoveringComps] = useState(false)

  // Brand form
  const [brandName, setBrandName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [regionType, setRegionType] = useState('global')
  const [regionCountry, setRegionCountry] = useState('')
  const [regionState, setRegionState] = useState('')
  const [regionCity, setRegionCity] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [compInput, setCompInput] = useState('')

  const fetchDashboard = useCallback(async (brandId?: string) => {
    try {
      setLoading(true)
      const [dashRes, planRes] = await Promise.all([
        fetch(`/api/dashboard${brandId ? `?brandId=${brandId}` : ''}`),
        fetch('/api/user/plan'),
      ])
      if (dashRes.status === 401) { window.location.href = '/login'; return }
      if (dashRes.ok) {
        const json: DashboardData = await dashRes.json()
        setData(json)
        if (json.selectedBrand && !brandId) setSelectedBrandId(json.selectedBrand.id)
        if (json.hasNoBrands) setShowAddBrand(true)
      }
      if (planRes.ok) setUserPlan(await planRes.json())
    } catch { /* network error */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  function resetBrandForm() {
    setBrandName(''); setWebsite(''); setIndustry(''); setCustomIndustry('')
    setRegionType('global'); setRegionCountry(''); setRegionState(''); setRegionCity('')
    setCompetitors([]); setCompInput('')
  }

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault()
    setSavingBrand(true)
    const finalIndustry = industry === 'custom' ? customIndustry : industry
    const marketRegion = regionType === 'global' ? { type: 'global' as const } :
      { type: regionType, country: regionCountry, state: regionState || undefined, city: regionCity || undefined }
    try {
      const res = await fetch('/api/brands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, website: website || undefined, industry: finalIndustry, competitors, marketRegion }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      const newBrand = await res.json()
      toast.success('Brand created! Running first scan...')
      setShowAddBrand(false)
      resetBrandForm()
      setSelectedBrandId(newBrand.id)
      await fetchDashboard(newBrand.id)
      // Auto-trigger first scan for the newly created brand
      triggerScanForBrand(newBrand.id)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally { setSavingBrand(false) }
  }

  async function handleRunScan() {
    const brandId = selectedBrandId || data?.selectedBrand?.id
    if (!brandId) return
    setScanning(true)
    toast.info('Scanning AI models... ~15-30 seconds')
    try {
      const r1 = await fetch('/api/scans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brandId }) })
      if (!r1.ok) throw new Error('Failed to start scan')
      const scan = await r1.json()
      const r2 = await fetch(`/api/scans/${scan.id}/execute`, { method: 'POST' })
      if (!r2.ok) throw new Error('Scan failed')
      const result = await r2.json()
      toast.success(`Done! Score: ${result.visibilityScore}/100`)
      fetchDashboard(brandId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Scan failed')
    } finally { setScanning(false) }
  }

  async function triggerScanForBrand(brandId: string) {
    setScanning(true)
    toast.info('Scanning AI models... ~15-30 seconds')
    try {
      const r1 = await fetch('/api/scans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brandId }) })
      if (!r1.ok) throw new Error('Failed to start scan')
      const scan = await r1.json()
      const r2 = await fetch(`/api/scans/${scan.id}/execute`, { method: 'POST' })
      if (!r2.ok) throw new Error('Scan failed')
      const result = await r2.json()
      toast.success(`Done! Score: ${result.visibilityScore}/100`)
      fetchDashboard(brandId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Scan failed')
    } finally { setScanning(false) }
  }

  async function handleGenerateFix() {
    if (!data?.latestScan) return
    setGeneratingFix(true)
    try {
      const res = await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scanId: data.latestScan.id }) })
      if (!res.ok) throw new Error('Failed')
      toast.success('Fix plan generated!')
      fetchDashboard(selectedBrandId || undefined)
    } catch { toast.error('Failed to generate fix plan') }
    finally { setGeneratingFix(false) }
  }

  async function toggleRec(id: string, completed: boolean) {
    await fetch('/api/recommendations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed: !completed }) })
    if (data) setData({ ...data, recommendations: data.recommendations.map(r => r.id === id ? { ...r, completed: !completed } : r) })
  }

  function addComp() {
    const c = compInput.trim()
    if (c && competitors.length < 3 && !competitors.includes(c)) { setCompetitors([...competitors, c]); setCompInput('') }
  }

  const scoreColor = (s: number) => s >= 60 ? 'text-emerald-400' : s >= 30 ? 'text-amber-400' : 'text-red-400'
  const scoreBg = (s: number) => s >= 60 ? 'bg-emerald-500/10 border-emerald-500/20' : s >= 30 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'
  const prioColor = (p: string) => p === 'high' ? 'bg-red-500/20 text-red-400' : p === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />)}
      </div>
      <div className="h-56 bg-slate-800/50 rounded-xl animate-pulse" />
    </div>
  )

  const brand = data?.selectedBrand
  const scan = data?.latestScan
  const region = brand?.market_region

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {data?.brands && data.brands.length > 1 ? (
            <select
              value={selectedBrandId ?? brand?.id ?? ''}
              onChange={e => { setSelectedBrandId(e.target.value); fetchDashboard(e.target.value) }}
              className="bg-slate-900 border border-slate-700 text-white h-9 text-sm rounded-md px-3 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {data.brands.map(b => (
                <option key={b.id} value={b.id}>{b.brand_name}</option>
              ))}
            </select>
          ) : brand ? (
            <h1 className="text-lg font-bold">{brand.brand_name}</h1>
          ) : null}
          {region && region.type !== 'global' && (
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {[region.city, region.state, region.country].filter(Boolean).join(', ')}
            </Badge>
          )}
          {(!region || region.type === 'global') && brand && (
            <Badge variant="outline" className="border-slate-700 text-slate-500 gap-1 text-xs">
              <Globe className="h-3 w-3" /> Global
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-8 text-xs px-3" onClick={() => setShowAddBrand(true)}>
            <Plus className="h-3 w-3 mr-1" /> Brand
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs px-4"
            onClick={() => {
              if (userPlan && !userPlan.canScan) {
                toast.error(`Scan limit reached (${userPlan.scansUsed}/${userPlan.scanLimit} this month). Upgrade your plan.`)
                window.location.href = '/dashboard/billing'
                return
              }
              handleRunScan()
            }}
            disabled={scanning || !brand}>
            {scanning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scan className="h-3 w-3 mr-1" />}
            {scanning ? 'Scanning...' : `Run Scan${userPlan ? ` (${userPlan.scansUsed}/${userPlan.scanLimit})` : ''}`}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!brand && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-8 pb-8 text-center">
            <Eye className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-1">Welcome to AuraRank</h2>
            <p className="text-slate-400 text-sm mb-4">Add your brand to start tracking AI visibility</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-9" onClick={() => setShowAddBrand(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your Brand
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Score cards */}
      {scan && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className={`border ${scoreBg(scan.visibility_score)}`}>
              <CardContent className="pt-3 pb-3 text-center">
                <Eye className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Visibility</p>
                <p className={`text-3xl font-bold ${scoreColor(scan.visibility_score)}`}>{scan.visibility_score}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Mentions</p>
                <p className="text-3xl font-bold text-white">{scan.mention_count}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Competitors</p>
                <p className="text-3xl font-bold text-amber-400">{scan.competitor_mention_count}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Opportunities</p>
                <p className="text-3xl font-bold text-emerald-400">{data?.promptOpportunities?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            {data?.competitorAnalysis && data.competitorAnalysis.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-400" /> Competitor Comparison
                    {userPlan && !userPlan.canViewCompetitors && (
                      <Badge className="bg-amber-500/20 text-amber-400 text-[9px] ml-auto">Pro+</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  {userPlan && !userPlan.canViewCompetitors ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400 mb-2">Upgrade to Pro to see detailed competitor scores</p>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs px-3" onClick={() => window.location.href = '/dashboard/billing'}>
                        Upgrade Plan
                      </Button>
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[
                      { name: brand?.brand_name || 'You', mentions: scan.mention_count, fill: '#6366f1' },
                      ...data.competitorAnalysis.map(c => ({ name: c.competitor_name, mentions: c.mention_count, fill: '#475569' })),
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                      <Bar dataKey="mentions" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
            {data?.scanHistory && data.scanHistory.length > 1 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Visibility Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={data.scanHistory.map(s => ({ date: format(new Date(s.scan_date), 'MMM d'), score: s.visibility_score }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Opportunities (collapsible) */}
          {data?.promptOpportunities && data.promptOpportunities.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800">
              <button className="w-full text-left" onClick={() => setShowOpportunities(!showOpportunities)}>
                <CardHeader className="py-3">
                  <CardTitle className="text-xs text-slate-400 uppercase tracking-wide flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-amber-400" />
                      Missed Opportunities ({data.promptOpportunities.length})
                    </span>
                    {showOpportunities ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </CardTitle>
                </CardHeader>
              </button>
              {showOpportunities && (
                <CardContent className="pt-0 pb-3 space-y-2">
                  {data.promptOpportunities.map(opp => (
                    <div key={opp.id} className="flex items-start justify-between gap-2 p-2.5 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="text-xs text-white">&ldquo;{opp.prompt}&rdquo;</p>
                        <div className="flex gap-1 mt-1">
                          {opp.competitors_found.map((c, i) => (
                            <Badge key={i} className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] px-1.5 py-0">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[9px] shrink-0">{opp.opportunity_score}</Badge>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Fix Plan (collapsible) */}
          <Card className="bg-slate-900/50 border-slate-800">
            <button className="w-full text-left" onClick={() => setShowFixPlan(!showFixPlan)}>
              <CardHeader className="py-3">
                <CardTitle className="text-xs text-slate-400 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                    Fix Plan {data?.recommendations?.length ? `(${data.recommendations.length})` : ''}
                    {userPlan && !userPlan.canViewFixPlan && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] ml-1">Max</Badge>
                    )}
                  </span>
                  {showFixPlan ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </CardTitle>
              </CardHeader>
            </button>
            {showFixPlan && (
              <CardContent className="pt-0 pb-3 space-y-2">
                {userPlan && !userPlan.canViewFixPlan ? (
                  <div className="text-center py-6">
                    <Sparkles className="h-8 w-8 text-emerald-500/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white mb-1">Unlock AI Fix Plan</p>
                    <p className="text-xs text-slate-400 mb-3">Upgrade to Max to get personalized recommendations on how to improve your AI visibility, plus bonus optimization tips.</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs px-4" onClick={() => window.location.href = '/dashboard/billing'}>
                      Upgrade to Max — $79/mo
                    </Button>
                  </div>
                ) : !data?.recommendations?.length ? (
                  <div className="text-center py-4">
                    <Sparkles className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-2">Get AI-powered improvement recommendations</p>
                    <Button onClick={handleGenerateFix} disabled={generatingFix} className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs px-3">
                      {generatingFix ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Generate Fix Plan
                    </Button>
                  </div>
                ) : (
                  data.recommendations.map(rec => (
                    <div key={rec.id} className={`flex items-start gap-2.5 p-2.5 bg-slate-800/30 rounded-lg ${rec.completed ? 'opacity-40' : ''}`}>
                      <button onClick={() => toggleRec(rec.id, rec.completed)} className="mt-0.5 shrink-0">
                        {rec.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-xs font-medium ${rec.completed ? 'line-through text-slate-500' : 'text-white'}`}>{rec.task_title}</p>
                          <Badge className={`${prioColor(rec.priority)} text-[9px] px-1.5 py-0`}>{rec.priority}</Badge>
                        </div>
                        {rec.task_description && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{rec.task_description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>

          <div className="text-center space-y-2">
            <p className="text-[10px] text-slate-600">
              Last scan: {format(new Date(scan.scan_date), 'MMM d, yyyy HH:mm')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 h-7 text-[10px] px-2.5 gap-1"
                onClick={() => {
                  const shareUrl = `${window.location.origin}/report/${btoa(scan.id)}`
                  navigator.clipboard.writeText(shareUrl)
                  toast.success('Share link copied to clipboard!')
                }}
              >
                <LinkIcon className="h-3 w-3" /> Copy Link
              </Button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My brand scored ${scan.visibility_score}/100 on AI visibility! Check yours at aurarank.io`)}&url=${encodeURIComponent(`${window.location.origin}/report/${btoa(scan.id)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-slate-700 text-slate-400 hover:bg-slate-800 h-7 text-[10px] px-2.5 gap-1 rounded-md transition-colors"
              >
                <Twitter className="h-3 w-3" /> Tweet
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/report/${btoa(scan.id)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-slate-700 text-slate-400 hover:bg-slate-800 h-7 text-[10px] px-2.5 gap-1 rounded-md transition-colors"
              >
                <Share2 className="h-3 w-3" /> LinkedIn
              </a>
            </div>
          </div>
        </>
      )}

      {/* No scan state */}
      {brand && !scan && !scanning && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-8 pb-8 text-center">
            <Scan className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-1">Ready to scan</h2>
            <p className="text-slate-400 text-sm mb-4">Run your first AI visibility scan for {brand.brand_name}</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleRunScan}>
              <Scan className="h-4 w-4 mr-2" /> Run First Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Brand Dialog */}
      <Dialog open={showAddBrand} onOpenChange={setShowAddBrand}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBrand} className="space-y-3">
            <div>
              <Label className="text-slate-300 text-xs">Brand Name *</Label>
              <Input value={brandName} onChange={e => setBrandName(e.target.value)} required placeholder="e.g. Salty Sea Food" className="bg-slate-800 border-slate-700 text-white h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Website</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" type="url" className="bg-slate-800 border-slate-700 text-white h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Industry *</Label>
              <Select value={industry} onValueChange={v => setIndustry(v ?? '')}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-8 text-sm mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind} className="text-white text-sm">{ind}</SelectItem>)}
                  <SelectItem value="custom" className="text-white text-sm">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {industry === 'custom' && (
                <Input value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} required placeholder="Your industry" className="bg-slate-800 border-slate-700 text-white h-8 text-sm mt-1.5" />
              )}
            </div>

            <div>
              <Label className="text-slate-300 text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Market Region
              </Label>
              <Select value={regionType} onValueChange={v => setRegionType(v ?? 'global')}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="global" className="text-white text-sm">Global (Worldwide)</SelectItem>
                  <SelectItem value="country" className="text-white text-sm">Country</SelectItem>
                  <SelectItem value="state" className="text-white text-sm">State / Region</SelectItem>
                  <SelectItem value="city" className="text-white text-sm">City / District</SelectItem>
                </SelectContent>
              </Select>
              {regionType !== 'global' && (
                <div className="space-y-1.5 mt-1.5">
                  <Input value={regionCountry} onChange={e => setRegionCountry(e.target.value)} placeholder="Country" required className="bg-slate-800 border-slate-700 text-white h-8 text-sm" />
                  {(regionType === 'state' || regionType === 'city') && (
                    <Input value={regionState} onChange={e => setRegionState(e.target.value)} placeholder="State / Region" className="bg-slate-800 border-slate-700 text-white h-8 text-sm" />
                  )}
                  {regionType === 'city' && (
                    <Input value={regionCity} onChange={e => setRegionCity(e.target.value)} placeholder="City / District" className="bg-slate-800 border-slate-700 text-white h-8 text-sm" />
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 text-xs">Competitors (max 3)</Label>
                <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 disabled:text-slate-600"
                  disabled={discoveringComps || !industry}
                  onClick={async () => {
                    setDiscoveringComps(true)
                    try {
                      const finalInd = industry === 'custom' ? customIndustry : industry
                      const regionStr = regionCountry ? [regionCity, regionState, regionCountry].filter(Boolean).join(', ') : ''
                      const res = await fetch('/api/competitors/discover', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ industry: finalInd, region: regionStr || undefined }),
                      })
                      if (res.ok) {
                        const { competitors: suggested } = await res.json()
                        setCompetitors(suggested.slice(0, 3))
                        toast.success(`Found ${suggested.length} competitors`)
                      }
                    } catch { /* ignore */ }
                    finally { setDiscoveringComps(false) }
                  }}>
                  {discoveringComps ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : <Sparkles className="h-3 w-3 inline mr-0.5" />}
                  {discoveringComps ? 'Finding...' : 'Auto-suggest'}
                </button>
              </div>
              <div className="flex gap-1.5 mt-1">
                <Input value={compInput} onChange={e => setCompInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addComp() } }}
                  placeholder="Competitor name" disabled={competitors.length >= 3}
                  className="bg-slate-800 border-slate-700 text-white h-8 text-sm" />
                <Button type="button" variant="outline" onClick={addComp} disabled={competitors.length >= 3}
                  className="border-slate-700 text-slate-300 h-8 text-xs shrink-0 px-3">Add</Button>
              </div>
              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {competitors.map((c, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 gap-0.5 pr-1 text-xs">
                      {c}
                      <button type="button" onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} className="hover:text-red-400 ml-0.5">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={savingBrand} className="w-full bg-indigo-600 hover:bg-indigo-700 h-8 text-sm">
              {savingBrand ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Create Brand
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
