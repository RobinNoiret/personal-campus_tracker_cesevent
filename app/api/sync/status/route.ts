import { NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon'

/**
 * GET /api/sync/status
 *
 * Retourne le statut de la synchronisation
 * Utile pour afficher dans le front-end si les données sont à jour
 */
export async function GET() {
  try {
    // Récupérer les statistiques de base
    const [lastDonation, totalCount] = await Promise.all([
      sql`
        SELECT
          timestamp,
          name,
          amount,
          currency,
          created_at
        FROM donations
        ORDER BY timestamp DESC
        LIMIT 1
      `,
      sql`
        SELECT COUNT(*) as total
        FROM donations
      `
    ])

    const lastDonationData = lastDonation[0]
    const total = parseInt(totalCount[0]?.total || '0')

    if (!lastDonationData) {
      return NextResponse.json({
        success: true,
        data: {
          isInitialized: false,
          totalDonations: 0,
          message: 'Base de données vide - lancez le worker de synchronisation'
        }
      })
    }

    const now = Date.now()
    const lastSyncAge = now - lastDonationData.timestamp
    const isRecent = lastSyncAge < 5 * 60 * 1000 // Moins de 5 minutes

    return NextResponse.json({
      success: true,
      data: {
        isInitialized: true,
        totalDonations: total,
        lastDonation: {
          timestamp: lastDonationData.timestamp,
          name: lastDonationData.name,
          amount: parseFloat(lastDonationData.amount),
          currency: lastDonationData.currency,
          age: lastSyncAge,
          ageMinutes: Math.floor(lastSyncAge / 60000)
        },
        isRecent,
        databaseTime: lastDonationData.created_at,
        status: isRecent ? 'active' : 'stale'
      },
      timestamp: now
    })
  } catch (error) {
    console.error('Error in /api/sync/status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
