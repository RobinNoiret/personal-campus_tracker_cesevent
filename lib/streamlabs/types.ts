/**
 * Types pour l'API Streamlabs Charity
 * Documentation : https://dev.streamlabs.com/docs/donation-endpoints
 */

export interface StreamlabsDonation {
  donation_id: string
  name: string
  message: string
  amount: string
  currency: string
  created_at: number
  email?: string
  verified?: boolean
}

export interface StreamlabsApiResponse {
  data: StreamlabsDonation[]
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
 * Convertit une donation Streamlabs en format normalisé
 */
export function normalizeDonation(donation: StreamlabsDonation): NormalizedDonation {
  return {
    id: donation.donation_id,
    name: donation.name,
    message: donation.message || '',
    amount: parseFloat(donation.amount),
    currency: donation.currency,
    timestamp: donation.created_at,
    verified: donation.verified ?? true
  }
}
