import { CAMPUS_CONFIG, type CampusConfig } from './config'
import { normalizeText, extractHashtags, cleanHashtag } from './normalizer'

export interface ParseResult {
  campusId: string | null
  campusName: string | null
  confidence: 'high' | 'medium' | 'low'
  matchedOn: 'hashtag' | 'alias' | 'none'
}

/**
 * Parse un message de donation pour identifier le campus
 * Stratégie de parsing :
 * 1. Cherche d'abord des hashtags exacts (#Lyon, #Paris, etc.)
 * 2. Si pas de hashtag, cherche des alias dans le texte
 * 3. Retourne null si aucune correspondance
 */
export function parseCampusFromMessage(message: string): ParseResult {
  if (!message) {
    return {
      campusId: null,
      campusName: null,
      confidence: 'low',
      matchedOn: 'none'
    }
  }

  const normalizedMessage = normalizeText(message)
  const hashtags = extractHashtags(message)

  // Stratégie 1 : Hashtags (confiance haute)
  if (hashtags.length > 0) {
    for (const hashtag of hashtags) {
      const cleanTag = cleanHashtag(hashtag)

      for (const [campusId, config] of Object.entries(CAMPUS_CONFIG)) {
        const normalizedHashtags = config.hashtags.map(h => normalizeText(cleanHashtag(h)))

        if (normalizedHashtags.includes(cleanTag)) {
          return {
            campusId,
            campusName: config.name,
            confidence: 'high',
            matchedOn: 'hashtag'
          }
        }
      }
    }
  }

  // Stratégie 2 : Recherche d'alias dans le texte (confiance moyenne)
  for (const [campusId, config] of Object.entries(CAMPUS_CONFIG)) {
    for (const alias of config.aliases) {
      const normalizedAlias = normalizeText(alias)

      // Cherche le mot entier (avec des limites de mots)
      const wordBoundaryRegex = new RegExp(`\\b${normalizedAlias}\\b`, 'i')

      if (wordBoundaryRegex.test(normalizedMessage)) {
        return {
          campusId,
          campusName: config.name,
          confidence: 'medium',
          matchedOn: 'alias'
        }
      }
    }
  }

  // Aucune correspondance
  return {
    campusId: null,
    campusName: null,
    confidence: 'low',
    matchedOn: 'none'
  }
}

/**
 * Parse un tableau de donations et retourne les stats par campus
 */
export interface DonationWithCampus {
  id: string
  amount: number
  currency: string
  message: string
  name: string
  timestamp: number
  verified: boolean
  campus: ParseResult
}

export interface CampusStats {
  campusId: string
  campusName: string
  totalAmount: number
  donationCount: number
  donations: DonationWithCampus[]
}

export function aggregateDonationsByCampus(
  donations: DonationWithCampus[]
): Map<string, CampusStats> {
  const statsMap = new Map<string, CampusStats>()

  // Initialise tous les campus avec 0
  for (const [campusId, config] of Object.entries(CAMPUS_CONFIG)) {
    statsMap.set(campusId, {
      campusId,
      campusName: config.name,
      totalAmount: 0,
      donationCount: 0,
      donations: []
    })
  }

  // Agrège les donations
  for (const donation of donations) {
    if (donation.campus.campusId) {
      const stats = statsMap.get(donation.campus.campusId)
      if (stats) {
        stats.totalAmount += donation.amount
        stats.donationCount += 1
        stats.donations.push(donation)
      }
    }
  }

  return statsMap
}
