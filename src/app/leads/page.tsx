'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Sparkles, Phone, Star } from 'lucide-react'
import { ALL_STATUSES, type LeadStatus } from '@/types'
import StatusDropdown, { STATUS_CONFIG } from '@/components/ui/StatusDropdown'
import { getScoreColor } from '@/lib/scoring'

interface Lead {
  id: string; companyName: string; industry: string; location: string
  phone: string | null; reviewCount: number | null; hasWebsite: boolean
  familyOwned: boolean; googleRating: number | null; yearsInBiz: string | null
  leadScore: number | null; priority: string; status: string
}

const STATUS_BADGE: Record<string, string> = {
  'New Lead': 'bg-dark-500/60 text-white/50 border-white/10',
  'Researched': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Contacted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Follow Up Needed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Interested': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Demo Sent': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Closed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Not Interested': 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('score')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (industry) params.set('industry', industry)
    if (status) params.set('status', status)
    params.set('sort', sort)
    const res = await fetch(`/api/businesses?${params}`)
    const data = await res.json()
    setLeads(data.businesses || [])
    setLoading(false)
  }, [search, industry, status, sort])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    await fetch(`/api/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
    setUpdating(null)
  }

  const noWebsite = leads.filter(l => !l.hasWebsite).length
  const highPri = leads.filter(l => l.priority === 'High').length

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Lead Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {leads.length} leads · {noWebsite} no website · {highPri} high priority
          </p>
        </div>
        <Link href="/bulk-import" className="btn-crimson text-sm">+ Import leads</Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={industry} onChange={e => setIndustry(e.target.value)}
          className="input-dark text-xs py-1.5 w-auto">
          <option value="">All industries</option>
          <option>Painters</option>
          <option>Carpet Cleaners</option>
          <option>Auto Body Shops</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="input-dark text-xs py-1.5 w-auto">
          <option value="">All statuses</option>
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="input-dark text-xs py-1.5 w-auto">
          <option value="score">Highest score</option>
          <option value="reviews">Most reviews</option>
          <option value="name">Name A–Z</option>
          <option value="recent">Most recent</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {leads.length} results
        </span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {['#', 'Company', 'Industry', 'Phone', 'Reviews', 'Website', 'Score', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="loading-skeleton h-3 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.map((lead, idx) => (
                <tr key={lead.id} className="table-row">
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="hover:text-crimson-400 transition-colors">
                      <div className="text-sm font-medium text-white">{lead.companyName}</div>
                      <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {lead.yearsInBiz && <span>{lead.yearsInBiz} yrs</span>}
                        {lead.familyOwned && <span className="text-purple-400/70">Family</span>}
                        {lead.googleRating ? <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{lead.googleRating}</span> : null}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{lead.industry}</td>
                  <td className="px-4 py-3 text-xs">
                    {lead.phone
                      ? <a href={`tel:${lead.phone}`} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</a>
                      : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {(lead.reviewCount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge text-[10px] ${lead.hasWebsite
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {lead.hasWebsite ? '✓ Has site' : '✗ No site'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 score-bar">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${lead.leadScore || 0}%`, background: (lead.leadScore || 0) >= 70 ? '#22c55e' : (lead.leadScore || 0) >= 45 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(lead.leadScore || 0)}`}>
                        {lead.leadScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusDropdown
                      value={lead.status}
                      onChange={s => updateStatus(lead.id, s)}
                      disabled={updating === lead.id}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`}
                      className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1 whitespace-nowrap">
                      <Sparkles className="w-3 h-3" /> AI
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && leads.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No leads found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
