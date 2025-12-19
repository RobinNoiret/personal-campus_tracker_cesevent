import { NextRequest, NextResponse } from 'next/server'
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage } from '@/lib/campus/parser'
import { sql } from '@/lib/db/neon'

/**
 * API Route pour la synchronisation automatique via Vercel Cron
 *
 * Cette route est appelée périodiquement par Vercel Cron Jobs
 * pour synchroniser les donations depuis Streamlabs vers PostgreSQL
 */

/**
 * Récupère le timestamp de la dernière donation en base
 */
async function getLastDonationTimestamp(): Promise<number | null> {
  try {
    const result = await sql`
      SELECT MAX(timestamp) as last_timestamp
      FROM donations
    `
    return result[0]?.last_timestamp || null
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier timestamp:', error)
    return null
  }
}

/**
 * Déduplique les donations par ID
 */
function deduplicateDonations(donations: any[]): any[] {
  const seen = new Set<string>()
  const deduplicated: any[] = []

  for (const donation of donations) {
    if (!seen.has(donation.id)) {
      seen.add(donation.id)
      deduplicated.push(donation)
    }
  }

  return deduplicated
}

/**
 * Sauvegarde les donations en base de données
 */
async function saveDonations(donations: any[]): Promise<number> {
  // Dédupliquer les donations avant insertion
  const uniqueDonations = deduplicateDonations(donations)

  console.log(`[CRON] ${donations.length} donations récupérées, ${uniqueDonations.length} uniques après déduplication`)

  let savedCount = 0

  for (const donation of uniqueDonations) {
    try {
      // Parser le campus
      const campusInfo = parseCampusFromMessage(donation.message || '')

      // Convertir la confiance en nombre
      const confidenceMap = { high: 0.9, medium: 0.6, low: 0.3 }
      const confidenceValue = confidenceMap[campusInfo.confidence]

      // Insérer ou ignorer si existe déjà
      await sql`
        INSERT INTO donations (
          id,
          name,
          email,
          message,
          amount,
          currency,
          timestamp,
          verified,
          campus_id,
          campus_name,
          campus_confidence
        )
        VALUES (
          ${donation.id},
          ${donation.name},
          ${null},
          ${donation.message || ''},
          ${donation.amount},
          ${donation.currency},
          ${donation.timestamp},
          ${donation.verified},
          ${campusInfo.campusId},
          ${campusInfo.campusName},
          ${confidenceValue}
        )
        ON CONFLICT (id) DO NOTHING
      `
      savedCount++
    } catch (error: any) {
      // Ignorer les erreurs de duplication
      if (!error.message?.includes('duplicate key')) {
        console.error(`Erreur pour ${donation.name}:`, error.message)
      }
    }
  }

  return savedCount
}

export async function GET(request: NextRequest) {
  // Vérifier l'autorisation via le CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('[CRON] Début de la synchronisation...')

    const client = getStreamlabsClient()

    // Récupérer le timestamp de la dernière donation
    const lastTimestamp = await getLastDonationTimestamp()

    let donations: any[]

    if (lastTimestamp) {
      // Récupérer uniquement les nouvelles donations depuis le dernier timestamp
      console.log(`[CRON] Récupération des donations depuis ${new Date(lastTimestamp).toLocaleString()}`)
      donations = await client.getAllDonationsSince(lastTimestamp)
    } else {
      // Base vide : récupérer les 100 dernières donations
      console.log('[CRON] Première synchronisation - récupération des 100 dernières donations')
      donations = await client.getAllDonations(100)
    }

    if (donations.length === 0) {
      console.log('[CRON] Aucune nouvelle donation')
      return NextResponse.json({
        success: true,
        message: 'Aucune nouvelle donation',
        synced: 0
      })
    }

    console.log(`[CRON] ${donations.length} donation(s) récupérée(s)`)

    // Sauvegarder en base
    const savedCount = await saveDonations(donations)

    console.log(`[CRON] ${savedCount} donation(s) sauvegardée(s)`)

    return NextResponse.json({
      success: true,
      message: `Synchronisation réussie: ${savedCount} donation(s) sauvegardée(s)`,
      synced: savedCount,
      total: donations.length
    })

  } catch (error: any) {
    console.error('[CRON] Erreur lors de la synchronisation:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
