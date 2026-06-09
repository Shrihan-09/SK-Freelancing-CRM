'use client'
import AppShell from '@/components/AppShell'
import { useState, useEffect } from 'react'
import { Phone, PhoneOff, PhoneMissed, PhoneCall, CheckCircle, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/scoring'

const OUTCOMES = [
  { id: 'called', label: 'Connected', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'voicemail', label: 'Voicemail', icon: PhoneOff, color: 'text-amber-400' },
  { id: 'no-answer', label: 'No answer', icon: PhoneMissed, color: 'text-red-400' },
  { id: 'interested', label: 'Interested!', icon: Star, color: 'text-purple-400' },
]

export default function CallsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/businesses?sort=score')
      .then(r => r.json())
      .then(d => {
        const withPhone = (d.businesses || []).filter((b: any) => b.phone)
        setLeads(withPhone)
        setLoading(false)
      })
  }, [])

  const logCall = async (id: string, outcome: string) => {
    setLogging(id)
    await fetch(`/api/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: outcome === 'interested' ? 'Interested' : outcome === 'called' ? 'Contacted' : 'Follow Up Needed',
      }),
    })
    setLeads(prev => prev.map(l => l.id === id
      ? { ...l, status: outcome === 'interested' ? 'Interested' : 'Contacted' }
      : l
    ))
    setLogging(null)
  }

  return (
    <AppShell>
      <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-white">Cold Call Queue</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {leads.length} leads with phone numbers · sorted by score
          </p>
        </div>

        {/* Mobile-optimized call cards */}
        <div className="space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="loading-skeleton h-4 rounded w-2/3" />
              <div className="loading-skeleton h-3 rounded w-1/3" />
              <div className="loading-skeleton h-10 rounded w-full" />
            </div>
          )) : leads.map(lead => (
            <div key={lead.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/leads/${lead.id}`} className="text-sm font-medium text-white hover:text-crimson-400 truncate block">
                    {lead.companyName}
                  </Link>
                  <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>{lead.industry}</span>
                    <span>·</span>
                    <span>{(lead.reviewCount || 0).toLocaleString()} reviews</span>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${getScoreColor(lead.leadScore || 0)}`}>
                  {lead.leadScore}
                </span>
              </div>

              {/* Big call button */}
              <a href={`tel:${lead.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white' }}>
                <Phone className="w-4 h-4" /> {lead.phone}
              </a>

              {/* Outcome buttons */}
              <div className="grid grid-cols-4 gap-2">
                {OUTCOMES.map(o => (
                  <button key={o.id} onClick={() => logCall(lead.id, o.id)}
                    disabled={logging === lead.id}
                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {logging === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white/30" /> : <o.icon className={`w-3.5 h-3.5 ${o.color}`} />}
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{o.label}</span>
                  </button>
                ))}
              </div>

              {/* Current status */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Status: {lead.status}</span>
                <Link href={`/leads/${lead.id}`} className="text-xs text-crimson-400 hover:text-crimson-300">
                  View AI script →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
