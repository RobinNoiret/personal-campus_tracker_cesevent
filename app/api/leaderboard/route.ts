import { NextResponse } from 'next/server'
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage, aggregateDonationsByCampus, type DonationWithCampus } from '@/lib/campus/parser'
import { withCache } from '@/lib/cache'

/**
 * GET /api/leaderboard
 *
 * Récupère le classement des campus
 *
 * Sécurité :
 * - Route en lecture seule (GET uniquement)
 * - Cache de 30 secondes
 * - Données agrégées uniquement (pas de détails sensibles)
 */
export async function GET() {
  try {
    // Récupère les stats avec cache
    const leaderboard = await withCache(
      'leaderboard:stats',
      30 * 1000, // Cache de 30 secondes
      async () => {
        const client = getStreamlabsClient()
        const rawDonations = await client.getDonations(1000) // Récupère les 1000 dernières donations

        // Parse les donations
        const donationsWithCampus: DonationWithCampus[] = rawDonations.map(donation => ({
          ...donation,
          campus: parseCampusFromMessage(donation.message)
        }))

        // Agrège par campus
        const statsMap = aggregateDonationsByCampus(donationsWithCampus)

        // Convertit en array et trie par montant total
        const leaderboardArray = Array.from(statsMap.values())
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .map(campus => ({
            campusId: campus.campusId,
            campusName: campus.campusName,
            totalAmount: campus.totalAmount,
            donationCount: campus.donationCount,
            // On n'inclut pas les donations individuelles pour alléger la réponse
          }))

        // Calcule les totaux
        const totalAmount = leaderboardArray.reduce((sum, c) => sum + c.totalAmount, 0)
        const totalDonations = leaderboardArray.reduce((sum, c) => sum + c.donationCount, 0)

        // Compte les donations non identifiées
        const unidentifiedDonations = donationsWithCampus.filter(d => !d.campus.campusId)
        const unidentifiedAmount = unidentifiedDonations.reduce((sum, d) => sum + d.amount, 0)

        return {
          leaderboard: leaderboardArray,
          stats: {
            totalAmount,
            totalDonations,
            campusCount: leaderboardArray.filter(c => c.donationCount > 0).length,
            unidentified: {
              count: unidentifiedDonations.length,
              amount: unidentifiedAmount
            }
          }
        }
      }
    )

    return NextResponse.json({
      success: true,
      data: leaderboard,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error in /api/leaderboard:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
