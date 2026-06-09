'use client'
import AppShell from '@/components/AppShell'
import { useState, useEffect } from 'react'
import { Sparkles, Search, Loader2, ChevronRight, AlertTriangle, Zap } from 'lucide-react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/scoring'

export default function AnalysisPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [industry, setIndustry] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (industry) params.set('industry', industry)
    params.set('sort', 'score')
    fetch(`/api/businesses?${params}`)
      .then(r => r.json())
      .then(d => { setLeads(d.businesses || []); setLoading(false) })
  }, [search, industry])

  const analyzeOne = async (id: string) => {
    setAnalyzing(id)
    await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: id }),
    })
    setAnalyzing(null)
    // Refresh
    fetch(`/api/businesses?sort=score`)
      .then(r => r.json())
      .then(d => setLeads(d.businesses || []))
  }

  const noAnalysis = leads.filter((l: any) => !l.hasAnalysis)

  return (
    <AppShell>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">AI Business Analysis</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Generate AI opportunity reports for each business
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="glass-card p-5 flex items-start gap-4" style={{ borderColor: 'rgba(225,29,72,0.2)' }}>
          <div className="w-10 h-10 rounded-lg bg-crimson-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-crimson-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white mb-1">How AI analysis works</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Click "Analyze" on any business to generate a full AI report: problems found, website features to pitch,
              AI automation opportunities, and a personalized cold call script — all specific to that business.
              Analysis is saved and reusable.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 glass-card px-3 py-2 flex-1 min-w-48">
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={industry} onChange={e => setIndustry(e.target.value)}
            className="input-dark text-xs py-2 w-auto">
            <option value="">All industries</option>
            <option>Painters</option><option>Carpet Cleaners</option><option>Auto Body Shops</option>
          </select>
        </div>

        {/* Leads grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="loading-skeleton h-4 rounded w-3/4" />
              <div className="loading-skeleton h-3 rounded w-1/2" />
              <div className="loading-skeleton h-8 rounded w-full" />
            </div>
          )) : leads.map((lead: any) => (
            <div key={lead.id} className="glass-card p-5 flex flex-col gap-3 hover:border-crimson-500/20 transition-colors">
              <div>
                <Link href={`/leads/${lead.id}`} className="text-sm font-medium text-white hover:text-crimson-400 transition-colors line-clamp-2">
                  {lead.companyName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{lead.industry}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {(lead.reviewCount || 0).toLocaleString()} reviews
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  lead.hasWebsite
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {lead.hasWebsite ? 'Has site' : 'No website'}
                </span>
                <span className={`text-xs font-semibold ml-auto ${getScoreColor(lead.leadScore || 0)}`}>
                  Score: {lead.leadScore}
                </span>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => analyzeOne(lead.id)}
                  disabled={analyzing === lead.id}
                  className="btn-crimson text-xs flex-1 flex items-center justify-center gap-1.5">
                  {analyzing === lead.id
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                    : <><Sparkles className="w-3 h-3" /> Analyze</>}
                </button>
                <Link href={`/leads/${lead.id}`}
                  className="btn-ghost text-xs px-3 flex items-center gap-1">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
