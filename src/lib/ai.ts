import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface BusinessContext {
  companyName: string
  industry: string
  reviewCount: number
  googleRating?: number | null
  hasWebsite: boolean
  websiteUrl?: string | null
  familyOwned: boolean
  yearsInBiz?: string | null
  location?: string
  phone?: string | null
}

export interface AIAnalysisResult {
  problemsFound: string[]
  websiteOpportunities: WebsiteFeature[]
  automationOpps: Automation[]
  coldCallScript: ColdCallScript
  pitchSummary: string
}

export interface WebsiteFeature {
  name: string
  what: string
  why: string
  priority: 'High' | 'Medium' | 'Low'
  icon: string
}

export interface Automation {
  name: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
  revenue: string
  icon: string
}

export interface ColdCallScript {
  opener: string
  pain: string
  offer: string
  objection: string
  rebuttal: string
  close: string
}

export async function generateBusinessAnalysis(biz: BusinessContext): Promise<AIAnalysisResult> {
  const prompt = `You are a web design sales expert helping pitch websites to local NJ businesses.

Business: ${biz.companyName}
Industry: ${biz.industry}
Location: ${biz.location || 'Bridgewater, NJ'}
Google Reviews: ${biz.reviewCount} (Rating: ${biz.googleRating || 'unknown'})
Has Website: ${biz.hasWebsite ? 'Yes - ' + (biz.websiteUrl || 'URL unknown') : 'No website at all'}
Family Owned: ${biz.familyOwned ? 'Yes' : 'No'}
Years in Business: ${biz.yearsInBiz || 'Unknown'}
Phone: ${biz.phone || 'Not listed'}

Generate a comprehensive sales analysis. Return ONLY valid JSON with this exact structure:
{
  "problemsFound": ["problem1", "problem2", "problem3", "problem4", "problem5"],
  "websiteOpportunities": [
    {"name": "Feature Name", "what": "What it does in 1 sentence", "why": "How it makes them money in 1 sentence", "priority": "High", "icon": "phone"},
    ... 8 total features
  ],
  "automationOpps": [
    {"name": "Automation Name", "description": "What it automates", "impact": "High", "revenue": "How it saves/makes money", "icon": "bot"},
    ... 6 total automations
  ],
  "coldCallScript": {
    "opener": "Personalized first sentence for cold call",
    "pain": "Their #1 business problem right now",
    "offer": "Exact service to pitch them",
    "objection": "Most likely objection they will raise",
    "rebuttal": "How to handle that objection",
    "close": "Closing line to get next step"
  },
  "pitchSummary": "2-3 sentence executive summary of the opportunity and what to build"
}

Be specific to THIS business and THIS industry. Icons should be simple words like: phone, calendar, star, zap, shield, users, chart, mail, bell, clock, lock, globe, search, camera`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(clean) as AIAnalysisResult
}

export async function generateIndustryInsights(industry: string): Promise<{
  commonProblems: string[]
  topFeatures: string[]
  topAutomations: string[]
  pitchAngle: string
}> {
  const prompt = `Web design sales expert for NJ businesses.

Industry: ${industry}

Generate insights for pitching websites to ALL businesses in this industry.
Return ONLY valid JSON:
{
  "commonProblems": ["problem1", "problem2", "problem3", "problem4", "problem5"],
  "topFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "topAutomations": ["automation1", "automation2", "automation3", "automation4"],
  "pitchAngle": "2-sentence angle for pitching websites to this industry"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(clean)
}
