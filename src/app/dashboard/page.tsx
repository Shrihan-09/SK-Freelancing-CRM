export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Globe, TrendingUp, Phone, Users, Zap, ArrowRight, CheckCircle2, MessageSquare, Star, Bot } from 'lucide-react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/scoring'
export const revalidate = 0

const STATUS_EMOJI: Record<string, string> = {
  'New Lead': '🔥', 'Researched': '🔎', 'Contacted': '📞', 'Follow Up Needed': '⏰',
  'Interested': '⭐', 'Demo Sent': '🚀', 'Closed': '✅', 'Not Interested': '❌',
}

async function getDashboardData() {
  try {
    const [businesses, statusCounts, industryCounts, taskCounts, recentActivity] = await Promise.all([
      prisma.business.findMany({ orderBy: { leadScore: 'desc' }, take: 100, select: {
        id: true, companyName: true, industry: true, hasWebsite: true, phone: true,
        priority: true, leadScore: true, reviewCount: true, status: true, yearsInBiz: true, familyOwned: true
      }}),
      prisma.business.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.business.groupBy({ by: ['industry'], _count: { id: true } }),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }).catch(() => []),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 8,
        include: { business: { select: { companyName: true } } } }).catch(() => []),
    ])

    const total = businesses.length
    const noWebsite = businesses.filter(b => !b.hasWebsite).length
    const highPriority = businesses.filter(b => b.priority === 'High').length
    const hasPhone = businesses.filter(b => b.phone).length
    const closed = statusCounts.find(s => s.status === 'Closed')?._count?.id || 0
    const interested = (statusCounts.find(s => s.status === 'Interested')?._count?.id || 0) +
      (statusCounts.find(s => s.status === 'Demo Sent')?._count?.id || 0)

    const byStatus: Record<string, number> = {}
    statusCounts.forEach(s => { byStatus[s.status] = s._count.id })

    const byIndustry: Record<string, number> = {}
    industryCounts.forEach(i => { byIndustry[i.industry] = i._count.id })

    const tasksByStatus: Record<string, number> = {}
    taskCounts.forEach((t: any) => { tasksByStatus[t.status] = t._count.id })

    const topLeads = businesses.slice(0, 6)
    return { total, noWebsite, highPriority, hasPhone, closed, interested, topLeads, byStatus, byIndustry, tasksByStatus, recentActivity }
  } catch {
    return { total: 0, noWebsite: 0, highPriority: 0, hasPhone: 0, closed: 0, interested: 0, topLeads: [], byStatus: {}, byIndustry: {}, tasksByStatus: {}, recentActivity: [] }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    { label: 'Total Leads',    value: data.total,          sub: '3 industries',           icon: Users,       color: '#3b82f6', href: '/leads' },
    { label: 'No Website',     value: data.noWebsite,      sub: 'Primary targets',         icon: Globe,       color: '#e11d48', href: '/leads' },
    { label: 'High Priority',  value: data.highPriority,   sub: 'Score 70+',              icon: TrendingUp,  color: '#22c55e', href: '/leads?priority=High' },
    { label: 'Have Phone',     value: data.hasPhone,       sub: 'Can cold call now',      icon: Phone,       color: '#f59e0b', href: '/calls' },
    { label: 'Interested',     value: data.interested,     sub: 'Hot leads',              icon: Star,        color: '#a78bfa', href: '/leads' },
    { label: 'Closed Deals',   value: data.closed,         sub: `~$${(data.closed*2500).toLocaleString()} est.`, icon: CheckCircle2, color: '#4ade80', href: '/analytics' },
  ]

  const PIPELINE_ORDER = ['New Lead','Researched','Contacted','Follow Up Needed','Interested','Demo Sent','Closed','Not Interested']
  const PIPELINE_COLORS: Record<string, string> = {
    'New Lead':'#f97316','Researched':'#60a5fa','Contacted':'#34d399','Follow Up Needed':'#fbbf24',
    'Interested':'#a78bfa','Demo Sent':'#fb923c','Closed':'#4ade80','Not Interested':'#f87171'
  }
  const maxPipe = Math.max(...PIPELINE_ORDER.map(s => data.byStatus[s] || 0), 1)

  const IND_COLORS = ['#e11d48','#3b82f6','#22c55e','#f59e0b','#a855f7']
  const totalInd = Object.values(data.byIndustry).reduce((a, b) => a + b, 0) || 1

  const quickActions = [
    { label: 'View all leads',     href: '/leads',       icon: Users,         color: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa' },
    { label: 'Cold call queue',    href: '/calls',       icon: Phone,         color: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#4ade80' },
    { label: 'AI assistant',       href: '/ai',          icon: Bot,           color: 'rgba(225,29,72,0.15)',   border: 'rgba(225,29,72,0.3)',   text: '#fb7185' },
    { label: 'Team chat',          href: '/chat',        icon: MessageSquare, color: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
    { label: 'Kanban tasks',       href: '/tasks',       icon: CheckCircle2,  color: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
    { label: 'Analytics',          href: '/analytics',   icon: TrendingUp,    color: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            SK Freelancing · Bridgewater/Hillsborough NJ
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/bulk-import" className="btn-ghost text-sm flex items-center gap-1.5">
            Import leads
          </Link>
          <Link href="/ai" className="btn-crimson text-sm flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> AI Assistant
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="glass-card p-4 hover:border-opacity-40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${s.color}18` }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map(a => (
          <Link key={a.href} href={a.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: a.color, border: `1px solid ${a.border}` }}>
            <a.icon className="w-5 h-5" style={{ color: a.text }} />
            <span className="text-xs font-medium text-center" style={{ color: a.text }}>{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Outreach pipeline</h2>
            <Link href="/analytics" className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1">
              Full analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {PIPELINE_ORDER.map(status => {
              const count = data.byStatus[status] || 0
              const pct = Math.round((count / maxPipe) * 100)
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs w-6 text-center flex-shrink-0">{STATUS_EMOJI[status] || '•'}</span>
                  <span className="text-xs w-36 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>{status}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: PIPELINE_COLORS[status] || '#e11d48', opacity: 0.7 }} />
                  </div>
                  <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Industry */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-medium text-white mb-3">Industries</h2>
            <div className="space-y-2.5">
              {Object.entries(data.byIndustry).map(([ind, count], i) => (
                <div key={ind}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{ind}</span>
                    <span className="text-xs font-medium text-white">{count}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${(count / totalInd) * 100}%`, background: IND_COLORS[i % IND_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks summary */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white">Tasks</h2>
              <Link href="/tasks" className="text-xs text-crimson-400 hover:text-crimson-300">View board →</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Backlog',     color: '#888', key: 'Backlog' },
                { label: 'In Progress', color: '#60a5fa', key: 'In Progress' },
                { label: 'Review',      color: '#fbbf24', key: 'Review' },
                { label: 'Done',        color: '#4ade80', key: 'Completed' },
              ].map(t => (
                <div key={t.key} className="rounded-lg p-2 text-center"
                  style={{ background: `${t.color}10`, border: `1px solid ${t.color}25` }}>
                  <div className="text-lg font-semibold" style={{ color: t.color }}>
                    {data.tasksByStatus[t.key] || 0}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-medium text-white">Top opportunities</h2>
          <Link href="/leads?sort=score" className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1">
            All leads <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {['Business', 'Industry', 'Reviews', 'Website', 'Score', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topLeads.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No leads yet — <Link href="/bulk-import" className="text-crimson-400 hover:underline">import some</Link>
                </td></tr>
              ) : data.topLeads.map(lead => (
                <tr key={lead.id} className="table-row">
                  <td className="px-5 py-3">
                    <Link href={`/leads/${lead.id}`} className="text-sm font-medium text-white hover:text-crimson-400 transition-colors">
                      {lead.companyName}
                    </Link>
                    <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {lead.yearsInBiz && <span>{lead.yearsInBiz} yrs</span>}
                      {lead.familyOwned && <span className="text-purple-400/60">· Family</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{lead.industry}</td>
                  <td className="px-5 py-3 text-sm font-medium text-white">{(lead.reviewCount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      lead.hasWebsite ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {lead.hasWebsite ? '✓ Has site' : '✗ No site'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                      {lead.leadScore}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/leads/${lead.id}`} className="text-xs text-crimson-400 hover:text-crimson-300">
                      Analyze →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
