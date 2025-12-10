import { NextResponse } from 'next/server'
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage, type DonationWithCampus } from '@/lib/campus/parser'
import { withCache } from '@/lib/cache'

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
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const since = searchParams.get('since')
      ? parseInt(searchParams.get('since') as string)
      : undefined

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

        return donationsWithCampus
      }
    )

    return NextResponse.json({
      success: true,
      data: donations,
      count: donations.length,
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
