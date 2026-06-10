export type LeadStatus =
  | 'New Lead'
  | 'Researched'
  | 'Contacted'
  | 'Follow Up Needed'
  | 'Interested'
  | 'Demo Sent'
  | 'Closed'
  | 'Not Interested'

export type Priority = 'High' | 'Medium' | 'Low'

export type CallOutcome =
  | 'called'
  | 'voicemail'
  | 'no-answer'
  | 'interested'
  | 'not-interested'
  | 'callback'

export interface BusinessRecord {
  id: string
  companyName: string
  industry: string
  location: string
  city?: string | null
  state?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  hasWebsite: boolean
  googleRating?: number | null
  reviewCount?: number | null
  familyOwned: boolean
  yearsInBiz?: string | null
  websiteScore?: number | null
  leadScore?: number | null
  status: LeadStatus
  priority: Priority
  notes?: string | null
  lastContact?: Date | null
  nextFollowUp?: Date | null
  createdAt: Date
  analysis?: AnalysisRecord | null
}

export interface AnalysisRecord {
  id: string
  businessId: string
  problemsFound?: string | null
  websiteOpportunities?: string | null
  automationOpps?: string | null
  coldCallScript?: string | null
  recommendedFeatures?: string | null
  pitchSummary?: string | null
  generatedAt: Date
}

export interface DashboardStats {
  totalLeads: number
  noWebsite: number
  highPriority: number
  followUpsDue: number
  byStatus: Record<string, number>
  byIndustry: Record<string, number>
  recentActivity: BusinessRecord[]
  topOpportunities: BusinessRecord[]
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  'New Lead': 'bg-dark-500 text-dark-100 border-dark-400',
  'Researched': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Contacted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Follow Up Needed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Interested': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Demo Sent': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Closed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Not Interested': 'bg-red-500/10 text-red-400 border-red-500/20',
}

export const ALL_STATUSES: LeadStatus[] = [
  'New Lead', 'Researched', 'Contacted', 'Follow Up Needed',
  'Interested', 'Demo Sent', 'Closed', 'Not Interested',
]
