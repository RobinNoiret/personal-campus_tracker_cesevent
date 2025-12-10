import { NextResponse } from 'next/server'
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage, aggregateDonationsByCampus, type DonationWithCampus } from '@/lib/campus/parser'
import { withCache } from '@/lib/cache'
import { saveDonations, getStatsByCampus, getGlobalStats } from '@/lib/db/donations'

/**
 * GET /api/leaderboard
 *
 * Récupère le classement des campus
 *
 * Sécurité :
 * - Route en lecture seule (GET uniquement)
 * - Cache de 30 secondes
 * - Données agrégées uniquement (pas de détails sensibles)
 * - Sauvegarde en base de données pour persistance
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // Par défaut, lire depuis la base de données (plus rapide et fiable)
    const fromStreamlabs = searchParams.get('fromStreamlabs') === 'true'

    // Par défaut, récupère depuis la base de données
    if (!fromStreamlabs) {
      const [rawCampusStats, rawGlobalStats] = await Promise.all([
        getStatsByCampus(),
        getGlobalStats()
      ])

      // Transformer le format snake_case vers camelCase pour le front-end
      const campusStats = rawCampusStats.map(c => ({
        campusId: c.campus_id,
        campusName: c.campus_name,
        totalAmount: parseFloat(String(c.total_amount)),
        donationCount: parseInt(String(c.donation_count))
      }))

      const totalAmount = parseFloat(String(rawGlobalStats.total_amount || 0))
      const totalDonations = parseInt(String(rawGlobalStats.total_donations || 0))
      const unidentifiedAmount = parseFloat(String(rawGlobalStats.unidentified_amount || 0))
      const unidentifiedCount = parseInt(String(rawGlobalStats.unidentified_count || 0))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard: campusStats,
          stats: {
            totalAmount,
            totalDonations,
            campusCount: campusStats.filter(c => c.donationCount > 0).length,
            unidentified: {
              count: Math.max(0, unidentifiedCount),
              amount: Math.max(0, unidentifiedAmount)
            }
          }
        },
        source: 'database',
        timestamp: Date.now()
      })
    }

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

        // Sauvegarde en base de données (async, ne bloque pas la réponse)
        saveDonations(donationsWithCampus).catch(error => {
          console.error('Failed to save donations to database:', error)
        })

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
      source: 'streamlabs',
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
