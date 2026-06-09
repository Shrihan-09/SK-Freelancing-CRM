import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        companyName: true,
        industry: true,
        location: true,
        city: true,
        status: true,
        priority: true,
        leadScore: true,
        hasWebsite: true,
        reviewCount: true,
        contractValue: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (businesses.length === 0) {
      return NextResponse.json({
        empty: true,
        overview: { total: 0, contacted: 0, interested: 0, closed: 0, conversionRate: 0, estimatedRevenue: 0 },
        byStatus: [],
        byIndustry: [],
        byLocation: [],
        scoreDistribution: [],
        leadsOverTime: [],
        topLeads: [],
      })
    }

    // Overview stats
    const total = businesses.length
    const contacted = businesses.filter((b: typeof businesses[0]) => !['New Lead', 'Researched'].includes(b.status)).length
    const interested = businesses.filter((b: typeof businesses[0]) => ['Interested', 'Demo Sent', 'Closed'].includes(b.status)).length
    const closed = businesses.filter((b: typeof businesses[0]) => b.status === 'Closed').length
    const conversionRate = total > 0 ? Math.round((closed / total) * 100 * 10) / 10 : 0
    const estimatedRevenue = closed * 2500 // avg $2500 per site

    type BizRow = typeof businesses[0]
    // By status
    const statusMap: Record<string, number> = {}
    businesses.forEach((b: BizRow) => { statusMap[b.status] = (statusMap[b.status] || 0) + 1 })
    const byStatus = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)

    // By industry
    const indMap: Record<string, number> = {}
    businesses.forEach((b: BizRow) => { indMap[b.industry] = (indMap[b.industry] || 0) + 1 })
    const byIndustry = Object.entries(indMap)
      .map(([industry, count]) => ({ industry, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)

    // By location
    const locMap: Record<string, { total: number; contacted: number }> = {}
    businesses.forEach((b: BizRow) => {
      const loc = b.city || b.location || 'Unknown'
      if (!locMap[loc]) locMap[loc] = { total: 0, contacted: 0 }
      locMap[loc].total++
      if (!['New Lead', 'Researched'].includes(b.status)) locMap[loc].contacted++
    })
    const byLocation = Object.entries(locMap)
      .map(([location, d]) => ({ location, ...d, rate: Math.round((d.contacted / d.total) * 100) }))
      .sort((a, b) => b.total - a.total)

    // Score distribution buckets
    const buckets = [
      { label: '0–20', min: 0, max: 20 },
      { label: '21–40', min: 21, max: 40 },
      { label: '41–60', min: 41, max: 60 },
      { label: '61–80', min: 61, max: 80 },
      { label: '81–99', min: 81, max: 99 },
    ]
    const scoreDistribution = buckets.map(bkt => ({
      label: bkt.label,
      count: businesses.filter((biz: BizRow) => (biz.leadScore || 0) >= bkt.min && (biz.leadScore || 0) <= bkt.max).length,
    }))

    // Leads over time (by week)
    const now = new Date()
    const weeks: Record<string, number> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const key = d.toISOString().slice(0, 10)
      weeks[key] = 0
    }
    businesses.forEach((b: BizRow) => {
      const keys = Object.keys(weeks)
      for (let i = keys.length - 1; i >= 0; i--) {
        if (new Date(b.createdAt) >= new Date(keys[i])) {
          weeks[keys[i]]++
          break
        }
      }
    })
    const leadsOverTime = Object.entries(weeks).map(([date, count]) => ({ date, count }))

    // Top leads
    const topLeads = [...businesses]
      .sort((a: BizRow, b: BizRow) => (b.leadScore || 0) - (a.leadScore || 0))
      .slice(0, 5)
      .map((b: BizRow) => ({ id: b.id, companyName: b.companyName, industry: b.industry, leadScore: b.leadScore, status: b.status }))

    return NextResponse.json({
      empty: false,
      overview: { total, contacted, interested, closed, conversionRate, estimatedRevenue },
      byStatus,
      byIndustry,
      byLocation,
      scoreDistribution,
      leadsOverTime,
      topLeads,
    })
  } catch (err: any) {
    console.error('Analytics error:', err)
    return NextResponse.json({
      empty: true,
      error: err.message,
      overview: { total: 0, contacted: 0, interested: 0, closed: 0, conversionRate: 0, estimatedRevenue: 0 },
      byStatus: [], byIndustry: [], byLocation: [], scoreDistribution: [], leadsOverTime: [], topLeads: [],
    })
  }
}
