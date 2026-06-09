import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calcScore(b: any) {
  let s = 0
  if (!b.hasWebsite) s += 35; else s += 5
  const r = b.reviewCount || 0
  if (r > 500) s += 25; else if (r > 100) s += 18; else if (r > 30) s += 12; else s += 5
  if (b.familyOwned) s += 10
  if (b.phone) s += 10
  if ((b.googleRating || 0) >= 4.9) s += 8; else if ((b.googleRating || 0) >= 4.5) s += 5
  const corps = ['Stanley Steemer', 'CertaPro', 'Voda', 'Precision Painting']
  if (corps.some(c => b.companyName.includes(c))) s = Math.max(s - 20, 5)
  return Math.min(s, 99)
}

const industries = [
  { name: 'Painters', slug: 'painters', color: '#22c55e', icon: 'paint-bucket' },
  { name: 'Carpet Cleaners', slug: 'carpet-cleaners', color: '#3b82f6', icon: 'sparkles' },
  { name: 'Auto Body Shops', slug: 'auto-body-shops', color: '#ef4444', icon: 'car' },
]

const locations = [
  { city: 'Bridgewater', state: 'NJ', county: 'Somerset' },
  { city: 'Hillsborough', state: 'NJ', county: 'Somerset' },
  { city: 'Somerville', state: 'NJ', county: 'Somerset' },
  { city: 'Raritan', state: 'NJ', county: 'Somerset' },
]

const businesses = [
  { companyName: 'Brush House Painting and Flooring Services', industry: 'Painters', phone: null, reviewCount: 706, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '4+' },
  { companyName: 'Five Star Painting of Edison and Red Bank', industry: 'Painters', phone: '(732) 952-1700', reviewCount: 168, hasWebsite: true, familyOwned: true, googleRating: 4.9, yearsInBiz: '9+' },
  { companyName: 'CertaPro Painters of Hunterdon County NJ', industry: 'Painters', phone: null, reviewCount: 197, hasWebsite: true, familyOwned: false, googleRating: 4.8, yearsInBiz: '25+' },
  { companyName: 'Renu Kitchen', industry: 'Painters', phone: '(732) 426-0330', reviewCount: 43, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '4+' },
  { companyName: 'Painting Plus Home Improvement LLC', industry: 'Painters', phone: '(856) 998-1036', reviewCount: 147, hasWebsite: false, familyOwned: true, googleRating: 4.9, yearsInBiz: '11+' },
  { companyName: 'PatchMaster Morris & Somerset', industry: 'Painters', phone: '(862) 310-0048', reviewCount: 94, hasWebsite: false, familyOwned: false, googleRating: 4.9, yearsInBiz: '10+' },
  { companyName: 'Precision Painting Plus of Central New Jersey', industry: 'Painters', phone: null, reviewCount: 48, hasWebsite: true, familyOwned: false, googleRating: 4.9, yearsInBiz: '19+' },
  { companyName: 'EDP Painting Company LLC', industry: 'Painters', phone: null, reviewCount: 60, hasWebsite: false, familyOwned: true, googleRating: 4.8, yearsInBiz: '37+' },
  { companyName: 'Cs Painting LLC', industry: 'Painters', phone: null, reviewCount: 44, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '3+' },
  { companyName: 'Sweet Home Painting', industry: 'Painters', phone: null, reviewCount: 27, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '20+' },
  { companyName: 'Albert Renovations LLC', industry: 'Painters', phone: null, reviewCount: 8, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '2+' },
  { companyName: 'Grifith Painting & Restoration', industry: 'Painters', phone: null, reviewCount: 53, hasWebsite: false, familyOwned: true, googleRating: 4.9, yearsInBiz: '36+' },
  { companyName: 'Riteway Home Improvement LLC', industry: 'Painters', phone: null, reviewCount: 55, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '16+' },
  { companyName: 'New Generation Home Remodels', industry: 'Painters', phone: '(973) 814-7942', reviewCount: 122, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '16+' },
  { companyName: 'A Champion Painting Co', industry: 'Painters', phone: null, reviewCount: 1, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '43+' },
  { companyName: 'Paragon Home Remodeling Group LLC', industry: 'Painters', phone: null, reviewCount: 10, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '1' },
  { companyName: 'Nick Painting, LLC', industry: 'Painters', phone: null, reviewCount: 4, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '27+' },
  { companyName: 'White Cloud Construction INC', industry: 'Painters', phone: '(609) 568-7421', reviewCount: 20, hasWebsite: false, familyOwned: false, googleRating: 4.4, yearsInBiz: '6+' },
  { companyName: 'Guaranteed painting and construction', industry: 'Painters', phone: '(856) 259-0371', reviewCount: 78, hasWebsite: false, familyOwned: false, googleRating: 4.9, yearsInBiz: '25+' },
  { companyName: 'Red Trim Painting Services LLC', industry: 'Painters', phone: '(848) 322-8545', reviewCount: 22, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '5+' },
  { companyName: 'Cleaner Steamers', industry: 'Carpet Cleaners', phone: '(843) 427-1471', reviewCount: 840, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '5+' },
  { companyName: 'Flying Carpet Cleaning NJ', industry: 'Carpet Cleaners', phone: '(908) 452-6975', reviewCount: 46, hasWebsite: true, familyOwned: false, googleRating: 5.0, yearsInBiz: '6+' },
  { companyName: 'All County Chem-Dry', industry: 'Carpet Cleaners', phone: null, reviewCount: 43, hasWebsite: false, familyOwned: false, googleRating: 4.9, yearsInBiz: '48+' },
  { companyName: 'DC Carpet Care and Area Rug Cleaning', industry: 'Carpet Cleaners', phone: null, reviewCount: 325, hasWebsite: true, familyOwned: false, googleRating: 4.9, yearsInBiz: '25+' },
  { companyName: 'Couch & Carpet Cleaning Doctor Fabric', industry: 'Carpet Cleaners', phone: null, reviewCount: 710, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '25+' },
  { companyName: 'DHL Carpet & Water Damage Restoration', industry: 'Carpet Cleaners', phone: null, reviewCount: 172, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '7+' },
  { companyName: 'A&B Carpet Cleaning', industry: 'Carpet Cleaners', phone: null, reviewCount: 83, hasWebsite: false, familyOwned: false, googleRating: 4.9, yearsInBiz: '8+' },
  { companyName: 'Premier Carpet and Upholstery Cleaning', industry: 'Carpet Cleaners', phone: '(856) 312-6528', reviewCount: 8, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '11+' },
  { companyName: 'Voda Cleaning & Restoration of NJ', industry: 'Carpet Cleaners', phone: null, reviewCount: 151, hasWebsite: true, familyOwned: false, googleRating: 5.0, yearsInBiz: '2+' },
  { companyName: 'The Rug Shopping', industry: 'Carpet Cleaners', phone: null, reviewCount: 34, hasWebsite: false, familyOwned: true, googleRating: 5.0, yearsInBiz: '8+' },
  { companyName: 'Masoudnia Carpet Cleaning', industry: 'Carpet Cleaners', phone: null, reviewCount: 0, hasWebsite: false, familyOwned: false, googleRating: 0, yearsInBiz: '21+' },
  { companyName: 'NJ Shark Steamers', industry: 'Carpet Cleaners', phone: null, reviewCount: 14, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: 'New' },
  { companyName: 'Stanley Steemer', industry: 'Carpet Cleaners', phone: null, reviewCount: 4403, hasWebsite: true, familyOwned: false, googleRating: 4.9, yearsInBiz: '32+' },
  { companyName: 'Carpel Building Maintenance Solutions LLC', industry: 'Carpet Cleaners', phone: null, reviewCount: 13, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '36+' },
  { companyName: 'The Rug Curators', industry: 'Carpet Cleaners', phone: null, reviewCount: 12, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '25+' },
  { companyName: 'Certified Home Solution', industry: 'Carpet Cleaners', phone: null, reviewCount: 443, hasWebsite: false, familyOwned: false, googleRating: 4.8, yearsInBiz: '3+' },
  { companyName: 'Rug Cleaning Brooklyn', industry: 'Carpet Cleaners', phone: null, reviewCount: 28, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '14+' },
  { companyName: 'Marvel Cleaner', industry: 'Carpet Cleaners', phone: null, reviewCount: 8, hasWebsite: false, familyOwned: false, googleRating: 2.9, yearsInBiz: '11+' },
  { companyName: 'Insider Disinfecting', industry: 'Carpet Cleaners', phone: null, reviewCount: 87, hasWebsite: false, familyOwned: false, googleRating: 4.2, yearsInBiz: '11+' },
  { companyName: 'Next Level Carpet Cleaning', industry: 'Carpet Cleaners', phone: '(888) 254-2262', reviewCount: 56, hasWebsite: false, familyOwned: false, googleRating: 5.0, yearsInBiz: '8+' },
  { companyName: 'E&A Supreme Auto Body', industry: 'Auto Body Shops', phone: '(908) 862-4400', reviewCount: 51, hasWebsite: true, familyOwned: false, googleRating: 5.0, yearsInBiz: '5+' },
  { companyName: 'New Jersey Auto Art', industry: 'Auto Body Shops', phone: '(908) 680-0748', reviewCount: 109, hasWebsite: true, familyOwned: true, googleRating: 4.9, yearsInBiz: '37+' },
  { companyName: 'Kings Auto Body', industry: 'Auto Body Shops', phone: '(908) 233-1721', reviewCount: 98, hasWebsite: true, familyOwned: false, googleRating: 4.8, yearsInBiz: '20+' },
  { companyName: "Peotter's Auto Body, Inc.", industry: 'Auto Body Shops', phone: '(908) 273-4000', reviewCount: 649, hasWebsite: true, familyOwned: false, googleRating: 4.9, yearsInBiz: '41+' },
]

async function main() {
  console.log('🌱 Seeding SK Freelancing database...')

  await prisma.aIAnalysis.deleteMany()
  await prisma.callLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.message.deleteMany()
  await prisma.business.deleteMany()
  await prisma.industry.deleteMany()
  await prisma.location.deleteMany()

  for (const ind of industries) {
    await prisma.industry.upsert({ where: { slug: ind.slug }, update: {}, create: ind })
  }
  for (const loc of locations) {
    await prisma.location.upsert({ where: { city_state: { city: loc.city, state: loc.state } }, update: {}, create: loc })
  }

  for (const biz of businesses) {
    const score = calcScore(biz)
    const priority = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'
    await prisma.business.create({
      data: { ...biz, location: 'Bridgewater, NJ', city: 'Bridgewater', state: 'NJ', leadScore: score, priority }
    })
  }

  await prisma.setting.upsert({ where: { key: 'app_name' }, update: {}, create: { key: 'app_name', value: 'SK Freelancing' } })

  console.log(`✅ Seeded ${businesses.length} businesses`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
