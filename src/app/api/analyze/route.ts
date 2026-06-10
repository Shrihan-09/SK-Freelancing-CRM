import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { businessId } = await req.json()
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = `You are a web design sales expert. Analyze this local NJ business and return ONLY valid JSON with no markdown:
{
  "problemsFound": ["problem1", "problem2", "problem3", "problem4"],
  "websiteOpportunities": [{"name":"feature","what":"what it does","why":"business value","priority":"High"}],
  "automationOpps": [{"name":"automation","description":"what it does","impact":"High","revenue":"how it helps"}],
  "coldCallScript": {"opener":"opening line","pain":"their problem","offer":"your pitch","objection":"likely objection","rebuttal":"your response","close":"closing line"},
  "pitchSummary": "2 sentence summary"
}

Business: ${business.companyName}
Industry: ${business.industry}
Reviews: ${business.reviewCount}
Has Website: ${business.hasWebsite}
Family Owned: ${business.familyOwned}
Location: ${business.location}`

  const text = await generateWithGemini(prompt)
  try {
    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    const analysis = JSON.parse(clean)
    return NextResponse.json({ analysis })
  } catch {
    return NextResponse.json({ analysis: { pitchSummary: text, problemsFound: [], websiteOpportunities: [], automationOpps: [], coldCallScript: {} } })
  }
}
