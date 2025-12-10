import { NextResponse } from 'next/server'
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage, type DonationWithCampus } from '@/lib/campus/parser'
import { withCache } from '@/lib/cache'
import { saveDonations, getAllDonations } from '@/lib/db/donations'

/**
 * GET /api/donations
 *
 * Récupère les donations depuis Streamlabs avec parsing des campus
 *
 * Sécurité :
 * - Route en lecture seule (GET uniquement)
 * - Cache de 30 secondes pour éviter le spam
 * - Token API jamais exposé au client
 * - Rate limiting via cache
 * - Sauvegarde en base de données pour persistance
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const since = searchParams.get('since')
      ? parseInt(searchParams.get('since') as string)
      : undefined
    // Par défaut, lire depuis la base de données (plus rapide et fiable)
    const fromStreamlabs = searchParams.get('fromStreamlabs') === 'true'

    // Par défaut, récupère depuis la base de données
    if (!fromStreamlabs) {
      const storedDonations = await getAllDonations({ limit, sortBy: 'timestamp', sortOrder: 'desc' })

      // Transformer le format pour correspondre à l'interface attendue par le front-end
      const donations = storedDonations.map(d => ({
        id: d.id,
        name: d.name,
        message: d.message,
        amount: parseFloat(String(d.amount)),
        currency: d.currency,
        timestamp: parseInt(String(d.timestamp)),
        verified: d.verified,
        campus: {
          campusId: d.campus_id,
          campusName: d.campus_name,
          confidence: d.campus_confidence >= 0.8 ? 'high' : d.campus_confidence >= 0.5 ? 'medium' : 'low',
          matchedOn: d.campus_id ? 'alias' : 'none'
        }
      }))

      return NextResponse.json({
        success: true,
        data: donations,
        count: donations.length,
        source: 'database',
        timestamp: Date.now()
      })
    }

    // Récupère les donations avec cache
    const donations = await withCache(
      `donations:${limit}:${since || 'all'}`,
      30 * 1000, // Cache de 30 secondes
      async () => {
        const client = getStreamlabsClient()

        let rawDonations
        if (since) {
          rawDonations = await client.getAllDonationsSince(since)
        } else {
          rawDonations = await client.getDonations(limit)
        }

        // Parse chaque donation pour identifier le campus
        const donationsWithCampus: DonationWithCampus[] = rawDonations.map(donation => ({
          ...donation,
          campus: parseCampusFromMessage(donation.message)
        }))

        // Sauvegarde en base de données (async, ne bloque pas la réponse)
        saveDonations(donationsWithCampus).catch(error => {
          console.error('Failed to save donations to database:', error)
        })

        return donationsWithCampus
      }
    )

    return NextResponse.json({
      success: true,
      data: donations,
      count: donations.length,
      source: 'streamlabs',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error in /api/donations:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch donations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
