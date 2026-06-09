import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLeadScore, getPriority } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { records } = body as { records: any[] }

  if (!records?.length) return NextResponse.json({ error: 'No records provided' }, { status: 400 })

  const results = { imported: 0, skipped: 0, errors: 0, businesses: [] as any[] }

  for (const raw of records) {
    try {
      const companyName = raw.company_name || raw['Company Name'] || raw.name || raw.Name || ''
      if (!companyName.trim()) { results.errors++; continue }

      // Deduplication check
      const existing = await prisma.business.findFirst({
        where: { companyName: { equals: companyName, mode: 'insensitive' } }
      })
      if (existing) { results.skipped++; continue }

      const phone = raw.phone || raw.Phone || null
      const website = raw.website || raw.Website || null
      const hasWebsite = !!(website && website !== 'none' && website !== '—' && website !== 'N/A')
      const reviewCount = parseInt(raw.reviews || raw['Google Reviews'] || raw.review_count || '0') || 0
      const industry = raw.industry || raw.category || raw.Category || raw.Industry || 'Other'
      const location = raw.location || raw.Location || 'New Jersey'
      const familyOwned = String(raw.family_owned || raw['Family Owned'] || '').toLowerCase() === 'yes'
      const googleRating = parseFloat(raw.rating || raw['Google Rating'] || '0') || null
      const yearsInBiz = raw.years || raw['Years in Business'] || null
      const notes = raw.notes || raw.Notes || null

      const bizData = { companyName, phone, website, hasWebsite, reviewCount, industry, location,
        familyOwned, googleRating, yearsInBiz, notes }
      const score = calculateLeadScore({ ...bizData, companyName })
      const priority = getPriority(score)

      const biz = await prisma.business.create({
        data: { ...bizData, leadScore: score, priority }
      })
      results.imported++
      results.businesses.push({ id: biz.id, companyName: biz.companyName, leadScore: biz.leadScore, priority: biz.priority })
    } catch (e) {
      results.errors++
    }
  }

  return NextResponse.json(results)
}
