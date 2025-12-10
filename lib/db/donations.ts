/**
 * Opérations de base de données pour les donations
 * PostgreSQL / Neon Database
 */

import { sql } from './neon'
import type { DonationWithCampus } from '@/lib/campus/parser'

export interface StoredDonation {
  id: string
  name: string
  email: string | null
  message: string
  amount: number
  currency: string
  timestamp: number
  verified: boolean
  campus_id: string | null
  campus_name: string | null
  campus_confidence: number
  created_at: Date
  updated_at: Date
}

export interface CampusStats {
  campus_id: string
  campus_name: string
  donation_count: number
  total_amount: number
  average_amount: number
  min_amount: number
  max_amount: number
  first_donation: Date
  last_donation: Date
}

export interface GlobalStats {
  total_donations: number
  total_amount: number
  average_amount: number
  min_amount: number
  max_amount: number
  campus_count: number
  first_donation: Date | null
  last_donation: Date | null
  unidentified_count: number
  unidentified_amount: number
}

/**
 * Sauvegarde une ou plusieurs donations (upsert)
 * Évite les doublons grâce à ON CONFLICT
 */
export async function saveDonations(donations: DonationWithCampus[]): Promise<number> {
  if (donations.length === 0) return 0

  try {
    let savedCount = 0

    for (const donation of donations) {
      const result = await sql`
        INSERT INTO donations (
          id, name, email, message, amount, currency, timestamp, verified,
          campus_id, campus_name, campus_confidence
        ) VALUES (
          ${donation.id},
          ${donation.name},
          ${null},  -- email non fourni par Streamlabs
          ${donation.message},
          ${donation.amount},
          ${donation.currency},
          ${donation.timestamp},
          ${donation.verified},
          ${donation.campus.campusId},
          ${donation.campus.campusName},
          ${donation.campus.confidence}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          message = EXCLUDED.message,
          amount = EXCLUDED.amount,
          campus_id = EXCLUDED.campus_id,
          campus_name = EXCLUDED.campus_name,
          campus_confidence = EXCLUDED.campus_confidence,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `
      if (result.length > 0) savedCount++
    }

    return savedCount
  } catch (error) {
    console.error('Error saving donations:', error)
    throw error
  }
}

/**
 * Récupère toutes les donations
 */
export async function getAllDonations(options?: {
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'amount' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}): Promise<StoredDonation[]> {
  const {
    limit = 1000,
    offset = 0,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options || {}

  try {
    // Utiliser des requêtes séparées selon le tri demandé
    let result: any[]

    if (sortBy === 'timestamp') {
      if (sortOrder === 'desc') {
        result = await sql`SELECT * FROM donations ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        result = await sql`SELECT * FROM donations ORDER BY timestamp ASC LIMIT ${limit} OFFSET ${offset}`
      }
    } else if (sortBy === 'amount') {
      if (sortOrder === 'desc') {
        result = await sql`SELECT * FROM donations ORDER BY amount DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        result = await sql`SELECT * FROM donations ORDER BY amount ASC LIMIT ${limit} OFFSET ${offset}`
      }
    } else {
      if (sortOrder === 'desc') {
        result = await sql`SELECT * FROM donations ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        result = await sql`SELECT * FROM donations ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`
      }
    }

    return result as StoredDonation[]
  } catch (error) {
    console.error('Error fetching donations:', error)
    throw error
  }
}

/**
 * Récupère les donations depuis un timestamp
 */
export async function getDonationsSince(timestamp: number): Promise<StoredDonation[]> {
  try {
    const result = await sql`
      SELECT * FROM donations
      WHERE timestamp >= ${timestamp}
      ORDER BY timestamp DESC
    `
    return result as StoredDonation[]
  } catch (error) {
    console.error('Error fetching donations since timestamp:', error)
    throw error
  }
}

/**
 * Récupère les donations d'un campus spécifique
 */
export async function getDonationsByCampus(campusId: string): Promise<StoredDonation[]> {
  try {
    const result = await sql`
      SELECT * FROM donations
      WHERE campus_id = ${campusId}
      ORDER BY timestamp DESC
    `
    return result as StoredDonation[]
  } catch (error) {
    console.error('Error fetching donations by campus:', error)
    throw error
  }
}

/**
 * Récupère les statistiques par campus (via la vue)
 */
export async function getStatsByCampus(): Promise<CampusStats[]> {
  try {
    const result = await sql`
      SELECT * FROM campus_stats
      ORDER BY total_amount DESC
    `
    return result as CampusStats[]
  } catch (error) {
    console.error('Error fetching campus stats:', error)
    throw error
  }
}

/**
 * Récupère les statistiques globales (via la vue)
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const result = await sql`
      SELECT * FROM global_stats
    `
    return result[0] as GlobalStats
  } catch (error) {
    console.error('Error fetching global stats:', error)
    throw error
  }
}

/**
 * Compte le nombre total de donations
 */
export async function countDonations(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM donations
    `
    return Number(result[0].count)
  } catch (error) {
    console.error('Error counting donations:', error)
    throw error
  }
}

/**
 * Exporte toutes les donations (pour dataviz)
 */
export async function exportDonationsJSON(): Promise<StoredDonation[]> {
  return getAllDonations({ limit: 999999 })
}

/**
 * Supprime toutes les donations (utilisez avec précaution!)
 */
export async function deleteAllDonations(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM donations
      RETURNING id
    `
    return result.length
  } catch (error) {
    console.error('Error deleting donations:', error)
    throw error
  }
}
