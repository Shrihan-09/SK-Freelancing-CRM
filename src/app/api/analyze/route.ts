import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBusinessAnalysis } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { businessId } = await req.json()
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })

  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    // Return mock data if no API key
    const mock = {
      problemsFound: ['No website', 'No online booking', 'No review generation system', 'No automated follow-up', 'Poor local SEO'],
      websiteOpportunities: [
        { name: 'Instant quote form', what: 'Multi-step form for estimates', why: 'Converts visitors at midnight when they want to book', priority: 'High', icon: 'phone' },
        { name: 'Before/After gallery', what: 'Photo grid of completed work', why: 'Visual proof converts skeptical customers', priority: 'High', icon: 'camera' },
        { name: 'Google Reviews embed', what: 'Live review feed on homepage', why: `Show off ${business.reviewCount} reviews automatically`, priority: 'High', icon: 'star' },
        { name: 'Online booking', what: 'Calendar-style appointment scheduler', why: 'Removes friction — no phone tag', priority: 'High', icon: 'calendar' },
        { name: 'Service area map', what: 'Interactive coverage map', why: 'Pre-qualifies visitors, saves calls', priority: 'Medium', icon: 'map' },
        { name: 'SEO service pages', what: 'Dedicated page per service', why: 'Ranks for "[service] near me" searches', priority: 'Medium', icon: 'search' },
        { name: 'Referral program page', what: 'Explain referral rewards', why: 'Turns 5-star customers into salespeople', priority: 'Low', icon: 'users' },
        { name: 'Mobile click-to-call', what: 'Sticky call button on mobile', why: '60%+ of searches happen on phones', priority: 'High', icon: 'phone' },
      ],
      automationOpps: [
        { name: 'Missed call text-back', description: 'Auto-texts anyone who calls and hangs up', impact: 'High', revenue: 'Recovers 30-40% of missed leads automatically', icon: 'phone' },
        { name: 'Review request bot', description: 'Texts customers 24hrs after job asking for Google review', impact: 'High', revenue: 'More reviews = higher ranking = more organic leads', icon: 'star' },
        { name: 'Estimate follow-up', description: 'Auto email/text 48hrs after estimate sent', impact: 'High', revenue: 'Converts 20-30% more quotes into jobs', icon: 'mail' },
        { name: 'Seasonal reminders', description: 'Emails past customers when service is due seasonally', impact: 'Medium', revenue: 'Reactivates existing customers at zero ad cost', icon: 'bell' },
        { name: 'AI chatbot', description: 'Answers FAQs and captures leads 24/7', impact: 'Medium', revenue: 'Captures leads outside business hours', icon: 'bot' },
        { name: 'New inquiry notification', description: 'Instant SMS to owner when form is submitted', impact: 'High', revenue: 'First to respond wins the job — always', icon: 'zap' },
      ],
      coldCallScript: {
        opener: `Hi, I came across ${business.companyName} on Google — you have ${business.reviewCount} amazing reviews but there's no easy way for customers to request an estimate online.`,
        pain: 'You\'re losing leads every night from people searching on their phones who don\'t want to call — they want to book or get a quote instantly.',
        offer: `I build websites for ${business.industry.toLowerCase()} in the area — a professional site with an instant quote form, your reviews displayed, and an automated follow-up system.`,
        objection: '"I get enough work from referrals and Google."',
        rebuttal: 'That\'s great — a website doesn\'t replace that, it multiplies it. Every referral Googles you before they call. Right now they\'re seeing nothing. A good site converts those searches into calls.',
        close: 'Can I show you a quick 10-minute mockup of what your site could look like? No commitment, completely free.',
      },
      pitchSummary: `${business.companyName} has strong social proof with ${business.reviewCount} Google reviews but zero web presence to convert online searchers into customers. The opportunity is a 5-page website with quote form, review integration, and automated follow-up — estimated $1,500–$3,000 project.`,
    }
    const record = await prisma.aIAnalysis.upsert({
      where: { businessId },
      update: {
        problemsFound: JSON.stringify(mock.problemsFound),
        websiteOpportunities: JSON.stringify(mock.websiteOpportunities),
        automationOpps: JSON.stringify(mock.automationOpps),
        coldCallScript: JSON.stringify(mock.coldCallScript),
        pitchSummary: mock.pitchSummary,
      },
      create: {
        businessId,
        problemsFound: JSON.stringify(mock.problemsFound),
        websiteOpportunities: JSON.stringify(mock.websiteOpportunities),
        automationOpps: JSON.stringify(mock.automationOpps),
        coldCallScript: JSON.stringify(mock.coldCallScript),
        pitchSummary: mock.pitchSummary,
      },
    })
    return NextResponse.json({ analysis: mock, record })
  }

  try {
    const result = await generateBusinessAnalysis({
      companyName: business.companyName,
      industry: business.industry,
      reviewCount: business.reviewCount || 0,
      googleRating: business.googleRating,
      hasWebsite: business.hasWebsite,
      websiteUrl: business.website,
      familyOwned: business.familyOwned,
      yearsInBiz: business.yearsInBiz,
      location: business.location,
      phone: business.phone,
    })

    await prisma.aIAnalysis.upsert({
      where: { businessId },
      update: {
        problemsFound: JSON.stringify(result.problemsFound),
        websiteOpportunities: JSON.stringify(result.websiteOpportunities),
        automationOpps: JSON.stringify(result.automationOpps),
        coldCallScript: JSON.stringify(result.coldCallScript),
        pitchSummary: result.pitchSummary,
      },
      create: {
        businessId,
        problemsFound: JSON.stringify(result.problemsFound),
        websiteOpportunities: JSON.stringify(result.websiteOpportunities),
        automationOpps: JSON.stringify(result.automationOpps),
        coldCallScript: JSON.stringify(result.coldCallScript),
        pitchSummary: result.pitchSummary,
      },
    })

    return NextResponse.json({ analysis: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
