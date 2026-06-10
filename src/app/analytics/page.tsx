'use client'
export const dynamic = 'force-dynamic'
import AppShell from '@/components/AppShell'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { TrendingUp, Users, Phone, Star, DollarSign, Target, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  'New Lead': '#f97316', 'Researched': '#60a5fa', 'Contacted': '#34d399',
  'Follow Up Needed': '#fbbf24', 'Interested': '#a78bfa', 'Demo Sent': '#fb923c',
  'Closed': '#4ade80', 'Not Interested': '#f87171',
}
const INDUSTRY_COLORS = ['#e11d48', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
    </div>
  )
}

function ChartCard({ title, children, isEmpty }: { title: string; children: React.ReactNode; isEmpty?: boolean }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      {isEmpty ? (
        <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          No data yet
        </div>
      ) : children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(225,29,72,0.3)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'white',
      boxShadow: '0 0 20px rgba(225,29,72,0.1)',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
        <Loader2 className="w-8 h-8 text-crimson-400 animate-spin" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading analytics...</p>
      </div>
    </AppShell>
  )

  if (error) return (
    <AppShell>
      <div className="p-6">
        <div className="glass-card p-8 text-center max-w-md mx-auto" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-white font-medium mb-2">Analytics unavailable</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
          <button onClick={() => { setLoading(true); setError(null); fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(e => { setError(e.message); setLoading(false) }) }}
            className="btn-crimson text-sm">Retry</button>
        </div>
      </div>
    </AppShell>
  )

  if (!data || data.empty) return (
    <AppShell>
      <div className="p-6 flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-crimson-500/10 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-crimson-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">No analytics data yet</h2>
          <p className="text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Add businesses to start tracking your outreach pipeline, conversion rates, and revenue.
          </p>
        </div>
        <Link href="/bulk-import" className="btn-crimson">Import leads to get started</Link>
      </div>
    </AppShell>
  )

  const { overview, byStatus, byIndustry, byLocation, scoreDistribution, leadsOverTime, topLeads } = data

  const statCards = [
    { label: 'Total Leads',       value: overview.total,                  sub: 'Across all industries',   icon: Users,       color: '#3b82f6' },
    { label: 'Contacted',         value: overview.contacted,              sub: `${Math.round(overview.contacted/Math.max(overview.total,1)*100)}% outreach rate`, icon: Phone, color: '#34d399' },
    { label: 'Interested',        value: overview.interested,             sub: 'Demo Sent + Interested',   icon: Star,        color: '#a78bfa' },
    { label: 'Closed Deals',      value: overview.closed,                 sub: 'Won clients',              icon: Target,      color: '#4ade80' },
    { label: 'Conversion Rate',   value: `${overview.conversionRate}%`,   sub: 'Leads → Closed',           icon: TrendingUp,  color: '#e11d48' },
    { label: 'Est. Revenue',      value: `$${overview.estimatedRevenue.toLocaleString()}`, sub: 'at avg $2,500/site', icon: DollarSign, color: '#fbbf24' },
  ]

  const axisStyle = { fill: 'rgba(255,255,255,0.4)', fontSize: 11 }

  return (
    <AppShell>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">Analytics</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Outreach performance · {overview.total} total leads
            </p>
          </div>
          <div className="glass-card px-3 py-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Live data · updates on page load
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Leads over time */}
        <ChartCard title="Leads added over time (weekly)" isEmpty={leadsOverTime.every((d: any) => d.count === 0)}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={axisStyle} tickFormatter={v => v.slice(5)} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Leads" stroke="#e11d48" strokeWidth={2}
                dot={{ fill: '#e11d48', r: 3 }} activeDot={{ r: 5, fill: '#fb7185' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Status breakdown */}
          <ChartCard title="Status breakdown" isEmpty={byStatus.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byStatus} layout="vertical" barSize={12}>
                <XAxis type="number" tick={axisStyle} />
                <YAxis dataKey="status" type="category" tick={axisStyle} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                  {byStatus.map((entry: any) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#e11d48'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Industry breakdown */}
          <ChartCard title="Industry breakdown" isEmpty={byIndustry.length === 0}>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={byIndustry} dataKey="count" nameKey="industry" cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {byIndustry.map((entry: any, i: number) => (
                      <Cell key={entry.industry} fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byIndustry.map((d: any, i: number) => (
                  <div key={d.industry} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length] }} />
                    <span className="text-xs flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{d.industry}</span>
                    <span className="text-xs font-medium text-white">{d.count}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Lead score distribution */}
          <ChartCard title="Lead score distribution" isEmpty={scoreDistribution.every((d: any) => d.count === 0)}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={scoreDistribution} barSize={28}>
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((d: any, i: number) => {
                    const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#4ade80']
                    return <Cell key={d.label} fill={colors[i]} fillOpacity={0.85} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Location performance */}
          <ChartCard title="Location performance" isEmpty={byLocation.length === 0}>
            <div className="space-y-3">
              {byLocation.slice(0, 6).map((loc: any) => (
                <div key={loc.location} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{loc.location}</span>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <span>{loc.contacted}/{loc.total} contacted</span>
                      <span className="font-medium" style={{ color: loc.rate > 50 ? '#4ade80' : loc.rate > 25 ? '#fbbf24' : '#f87171' }}>
                        {loc.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="score-bar">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(loc.total / (byLocation[0]?.total || 1)) * 100}%`, background: 'rgba(225,29,72,0.5)' }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Top leads table */}
        {topLeads.length > 0 && (
          <div className="glass-card">
            <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-medium text-white">Top scored leads</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {['Company', 'Industry', 'Score', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topLeads.map((lead: any) => (
                    <tr key={lead.id} className="table-row">
                      <td className="px-5 py-3">
                        <Link href={`/leads/${lead.id}`} className="text-sm font-medium text-white hover:text-crimson-400">
                          {lead.companyName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{lead.industry}</td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-bold" style={{ color: (lead.leadScore||0) >= 70 ? '#4ade80' : (lead.leadScore||0) >= 45 ? '#fbbf24' : '#f87171' }}>
                          {lead.leadScore}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ background: `${STATUS_COLORS[lead.status]}18`, color: STATUS_COLORS[lead.status] || '#fff', borderColor: `${STATUS_COLORS[lead.status]}40` }}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
