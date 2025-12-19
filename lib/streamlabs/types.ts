/**
 * Types pour l'API Streamlabs Charity
 * Documentation : https://streamlabscharity.com/api/v1/
 */

export interface StreamlabsCharityComment {
  id: string
  text: string
}

export interface StreamlabsCharityDonation {
  id: string
  display_name: string
  amount_usd: number
  converted_currency: string
  converted_amount: number
  original_currency: string
  original_amount: number
  team_currency: string
  team_amount: number
  member_currency: string
  member_amount: number
  country: string
  created_at: string
  team_member_id: string
  comment: StreamlabsCharityComment | null
  extra_information: any
}

export interface StreamlabsCharityMemberUser {
  id: string
  display_name: string
  slug: string
  is_live: boolean
  currency: string
}

export interface StreamlabsCharityMember {
  id: string
  can_use_team_alerts: boolean
  user: StreamlabsCharityMemberUser
}

export interface StreamlabsCharityDonationItem {
  id: string
  donation: StreamlabsCharityDonation
  member: StreamlabsCharityMember
}

export interface StreamlabsCharityApiResponse {
  data: StreamlabsCharityDonationItem[]
  pagination?: {
    current_page: number
    total_pages: number
    per_page: number
    total_count: number
  }
}

export interface NormalizedDonation {
  id: string
  name: string
  message: string
  amount: number
  currency: string
  timestamp: number
  verified: boolean
}

/**
 * Convertit une donation Streamlabs Charity en format normalisé
 */
export function normalizeDonation(item: StreamlabsCharityDonationItem): NormalizedDonation {
  const donation = item.donation

  return {
    id: donation.id,
    name: donation.display_name,
    message: donation.comment?.text || '',
    // Les montants sont en centimes, on les divise par 100
    amount: donation.team_amount / 100,
    currency: donation.team_currency,
    // Convertir la date ISO en timestamp milliseconds
    timestamp: new Date(donation.created_at).getTime(),
    verified: true
  }
}
