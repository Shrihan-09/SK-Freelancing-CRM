'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Sparkles, Phone, Globe, Star, Users, Zap,
  AlertTriangle, CheckCircle, Target, Bot, MessageSquare, Loader2
} from 'lucide-react'
import Link from 'next/link'
import StatusDropdown from '@/components/ui/StatusDropdown'
import { getScoreColor, getScoreBg } from '@/lib/scoring'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [lead, setLead] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'automations' | 'script'>('overview')
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/businesses/${id}`)
    const data = await res.json()
    setLead(data)
    setNotes(data.notes || '')
    if (data.analysis) {
      try {
        setAnalysis({
          problemsFound: JSON.parse(data.analysis.problemsFound || '[]'),
          websiteOpportunities: JSON.parse(data.analysis.websiteOpportunities || '[]'),
          automationOpps: JSON.parse(data.analysis.automationOpps || '[]'),
          coldCallScript: JSON.parse(data.analysis.coldCallScript || '{}'),
          pitchSummary: data.analysis.pitchSummary,
        })
      } catch {}
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchLead() }, [fetchLead])

  const runAnalysis = async () => {
    setAnalyzing(true)
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: id }),
    })
    const data = await res.json()
    if (data.analysis) setAnalysis(data.analysis)
    setAnalyzing(false)
  }

  const saveNotes = async () => {
    setSaving(true)
    await fetch(`/api/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
  }

  const updateStatus = async (status: string) => {
    setLead((prev: any) => ({ ...prev, status }))
    await fetch(`/api/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 text-crimson-400 animate-spin" />
    </div>
  )

  if (!lead) return <div className="p-6 text-white/50">Lead not found</div>

  const score = lead.leadScore || 0
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'features', label: 'Website Features', icon: Globe },
    { id: 'automations', label: 'Automations', icon: Bot },
    { id: 'script', label: 'Cold Call', icon: Phone },
  ]

  const impactColor = (i: string) => i === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    i === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-white/40 bg-white/5 border-white/10'

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/leads" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white truncate">{lead.companyName}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lead.industry} · {lead.location}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getScoreBg(score)}`}>
          <span className={getScoreColor(score)}>{score}</span>
          <span className="text-white/30 text-xs ml-1">/ 99</span>
        </div>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Reviews', value: (lead.reviewCount || 0).toLocaleString(), icon: Star },
          { label: 'Rating', value: lead.googleRating ? `★ ${lead.googleRating}` : '—', icon: Star },
          { label: 'Website', value: lead.hasWebsite ? 'Has site' : 'No website', icon: Globe },
          { label: 'Phone', value: lead.phone || '—', icon: Phone },
        ].map(f => (
          <div key={f.label} className="glass-card p-3">
            <div className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</div>
            <div className="text-sm font-medium text-white truncate">{f.value}</div>
          </div>
        ))}
      </div>

      {/* Status + Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <label className="text-xs mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Status</label>
          <StatusDropdown value={lead.status} onChange={updateStatus} />
        </div>
        <div className="glass-card p-4">
          <label className="text-xs mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Notes</label>
          <div className="flex gap-2">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="input-dark flex-1 text-sm resize-none" placeholder="Add notes..." />
            <button onClick={saveNotes} disabled={saving} className="btn-ghost text-xs px-3">
              {saving ? '...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="glass-card" style={{ borderColor: 'rgba(225,29,72,0.15)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-crimson-400" />
            <h2 className="text-sm font-medium text-white">AI Opportunity Report</h2>
          </div>
          <button onClick={runAnalysis} disabled={analyzing} className="btn-crimson text-xs flex items-center gap-2">
            {analyzing ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</> : <><Zap className="w-3 h-3" /> {analysis ? 'Regenerate' : 'Generate Analysis'}</>}
          </button>
        </div>

        {!analysis && !analyzing && (
          <div className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-crimson-400/30 mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Click "Generate Analysis" for a full AI opportunity report
            </p>
          </div>
        )}

        {analyzing && (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-crimson-400 animate-spin mx-auto" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Claude is analyzing {lead.companyName}...
            </p>
          </div>
        )}

        {analysis && !analyzing && (
          <>
            {/* Tabs */}
            <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === t.id
                      ? 'text-crimson-400 border-crimson-500'
                      : 'border-transparent hover:text-white/60'
                  }`}
                  style={{ color: activeTab === t.id ? undefined : 'rgba(255,255,255,0.35)' }}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-slide-up">
                  {analysis.pitchSummary && (
                    <div className="p-4 rounded-lg" style={{ background: 'rgba(225,29,72,0.05)', border: '1px solid rgba(225,29,72,0.15)' }}>
                      <div className="text-xs font-medium text-crimson-400 mb-2">PITCH SUMMARY</div>
                      <p className="text-sm leading-relaxed text-white/80">{analysis.pitchSummary}</p>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>PROBLEMS FOUND</div>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.problemsFound || []).map((p: string, i: number) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border bg-red-500/10 text-red-400 border-red-500/20">
                          <AlertTriangle className="w-3 h-3" /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-3 animate-slide-up">
                  {(analysis.websiteOpportunities || []).map((f: any, i: number) => (
                    <div key={i} className="glass-card p-4 hover:border-crimson-500/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{f.name}</span>
                            <span className={`status-badge text-[10px] ${impactColor(f.priority)}`}>{f.priority}</span>
                          </div>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.what}</p>
                          {f.why && <p className="text-xs text-emerald-400 mt-1">💡 {f.why}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'automations' && (
                <div className="space-y-3 animate-slide-up">
                  {(analysis.automationOpps || []).map((a: any, i: number) => (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{a.name}</span>
                            <span className={`status-badge text-[10px] ${impactColor(a.impact)}`}>{a.impact} impact</span>
                          </div>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{a.description}</p>
                          {a.revenue && <p className="text-xs text-emerald-400 mt-1">💰 {a.revenue}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'script' && analysis.coldCallScript && (
                <div className="space-y-4 animate-slide-up">
                  {[
                    { key: 'opener', label: 'Opening line', color: 'border-blue-500/30 bg-blue-500/5', textColor: 'text-blue-300' },
                    { key: 'pain', label: 'Their pain point', color: 'border-amber-500/30 bg-amber-500/5', textColor: 'text-amber-300' },
                    { key: 'offer', label: 'Your offer', color: 'border-emerald-500/30 bg-emerald-500/5', textColor: 'text-emerald-300' },
                    { key: 'objection', label: 'Likely objection', color: 'border-red-500/30 bg-red-500/5', textColor: 'text-red-300' },
                    { key: 'rebuttal', label: 'Your rebuttal', color: 'border-purple-500/30 bg-purple-500/5', textColor: 'text-purple-300' },
                    { key: 'close', label: 'Closing line', color: 'border-crimson-500/30 bg-crimson-500/5', textColor: 'text-crimson-300' },
                  ].map(f => (
                    <div key={f.key} className={`p-4 rounded-lg border ${f.color}`}>
                      <div className={`text-[10px] font-semibold tracking-wider mb-2 ${f.textColor}`}>{f.label.toUpperCase()}</div>
                      <p className="text-sm leading-relaxed text-white/80">{analysis.coldCallScript[f.key]}</p>
                    </div>
                  ))}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="btn-crimson flex items-center justify-center gap-2 w-full">
                      <Phone className="w-4 h-4" /> Call {lead.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
