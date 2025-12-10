import { NextResponse } from 'next/server'
import { exportDonationsJSON, getStatsByCampus, getGlobalStats, getAllDonations } from '@/lib/db/donations'

/**
 * GET /api/export
 *
 * Exporte toutes les donations pour dataviz
 *
 * Formats supportés:
 * - JSON (par défaut)
 * - CSV (format=csv)
 *
 * Sécurité:
 * - Route en lecture seule
 * - Peut contenir des données sensibles (noms de donateurs)
 * - À protéger en production si nécessaire
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const includeStats = searchParams.get('stats') === 'true'

    // Récupère toutes les donations
    const donations = await exportDonationsJSON()

    if (format === 'csv') {
      // Format CSV pour Excel/Google Sheets
      const csvHeader = 'ID,Nom,Message,Montant,Devise,Campus ID,Campus Nom,Date,Timestamp\n'
      const csvRows = donations.map(d => {
        const date = new Date(d.timestamp * 1000).toISOString()
        return [
          d.id,
          `"${d.name.replace(/"/g, '""')}"`,
          `"${d.message.replace(/"/g, '""')}"`,
          d.amount,
          d.currency,
          d.campus.campusId || '',
          `"${(d.campus.campusName || '').replace(/"/g, '""')}"`,
          date,
          d.timestamp
        ].join(',')
      }).join('\n')

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="donations-export-${Date.now()}.csv"`
        }
      })
    }

    // Format JSON (par défaut)
    let response: any = {
      success: true,
      exportDate: new Date().toISOString(),
      totalDonations: donations.length,
      donations
    }

    // Ajoute les statistiques si demandé
    if (includeStats) {
      const [campusStats, globalStats] = await Promise.all([
        getStatsByCampus(),
        getGlobalStats()
      ])

      response.statistics = {
        global: globalStats,
        byCampus: campusStats
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Disposition': `attachment; filename="donations-export-${Date.now()}.json"`
      }
    })
  } catch (error) {
    console.error('Error in /api/export:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export donations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
