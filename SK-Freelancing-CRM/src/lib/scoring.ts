export interface ScoringInput {
  hasWebsite: boolean
  reviewCount: number
  familyOwned: boolean
  phone?: string | null
  googleRating?: number | null
  companyName: string
  industry?: string
}

export function calculateLeadScore(b: ScoringInput): number {
  let score = 0

  // Website presence (biggest signal)
  if (!b.hasWebsite) score += 35
  else score += 5

  // Review volume = proven demand
  const reviews = b.reviewCount || 0
  if (reviews > 500) score += 25
  else if (reviews > 100) score += 18
  else if (reviews > 30) score += 12
  else if (reviews > 0) score += 5

  // Family owned = easier to reach decision maker
  if (b.familyOwned) score += 10

  // Phone available = can cold call
  if (b.phone && b.phone !== '—') score += 10

  // High rating = quality business worth pitching
  const rating = b.googleRating || 0
  if (rating >= 4.9) score += 8
  else if (rating >= 4.5) score += 5
  else if (rating >= 4.0) score += 2

  // Penalize large corporations (harder sale)
  const corps = ['Stanley Steemer', 'CertaPro', 'Voda Cleaning', 'Precision Painting Plus']
  if (corps.some(c => b.companyName.includes(c))) score = Math.max(score - 20, 5)

  return Math.min(score, 99)
}

export function getPriority(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 70) return 'High'
  if (score >= 45) return 'Medium'
  return 'Low'
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 45) return 'text-amber-400'
  return 'text-red-400'
}

export function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20'
  if (score >= 45) return 'bg-amber-500/10 border-amber-500/20'
  return 'bg-red-500/10 border-red-500/20'
}
