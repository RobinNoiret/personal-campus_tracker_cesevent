/**
 * Worker de synchronisation des donations
 *
 * Ce script tourne en arrière-plan et synchronise automatiquement
 * les donations depuis Streamlabs vers PostgreSQL
 *
 * Fonctionnalités :
 * - Polling intelligent toutes les 30 secondes
 * - Récupère uniquement les nouvelles donations
 * - Parse automatiquement les campus
 * - Gère les erreurs et reconnexions
 *
 * Usage:
 *   npm run sync
 */

// IMPORTANT: Charger les variables d'environnement AVANT les imports
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// Maintenant importer les modules
import { getStreamlabsClient } from '@/lib/streamlabs/client'
import { parseCampusFromMessage } from '@/lib/campus/parser'
import { sql } from '@/lib/db/neon'

// Configuration
const POLL_INTERVAL = 30 * 1000 // 30 secondes
const INITIAL_FETCH_LIMIT = 100 // Nombre de donations à récupérer au démarrage

interface SyncStats {
  totalSynced: number
  lastSyncTime: number | null
  lastDonationTimestamp: number | null
  errors: number
  consecutiveErrors: number
}

const stats: SyncStats = {
  totalSynced: 0,
  lastSyncTime: null,
  lastDonationTimestamp: null,
  errors: 0,
  consecutiveErrors: 0
}

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
    console.error('❌ Erreur lors de la récupération du dernier timestamp:', error)
    return null
  }
}

/**
 * Sauvegarde les donations en base de données
 */
async function saveDonations(donations: any[]): Promise<number> {
  let savedCount = 0

  for (const donation of donations) {
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
          ${donation.donation_id},
          ${donation.name},
          ${donation.email || null},
          ${donation.message || ''},
          ${parseFloat(donation.amount)},
          ${donation.currency},
          ${parseInt(donation.created_at) * 1000},
          ${donation.verified !== false},
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
        console.error(`   ⚠️  Erreur pour ${donation.name}:`, error.message)
      }
    }
  }

  return savedCount
}

/**
 * Synchronise les donations depuis Streamlabs
 */
async function syncDonations(): Promise<void> {
  try {
    const client = getStreamlabsClient()

    // Déterminer depuis quand récupérer les donations
    let donations: any[]

    if (stats.lastDonationTimestamp) {
      // Récupérer uniquement les nouvelles donations depuis le dernier timestamp
      console.log(`🔄 Récupération des donations depuis ${new Date(stats.lastDonationTimestamp).toLocaleString()}...`)
      donations = await client.getAllDonationsSince(stats.lastDonationTimestamp)
    } else {
      // Premier lancement : vérifier si la base contient déjà des données
      const lastTimestamp = await getLastDonationTimestamp()

      if (lastTimestamp) {
        console.log(`📚 Base de données existante détectée (dernière donation: ${new Date(lastTimestamp).toLocaleString()})`)
        stats.lastDonationTimestamp = lastTimestamp
        donations = await client.getAllDonationsSince(lastTimestamp)
      } else {
        // Base vide : récupérer les N dernières donations
        console.log(`🆕 Première synchronisation - récupération des ${INITIAL_FETCH_LIMIT} dernières donations...`)
        donations = await client.getAllDonations(INITIAL_FETCH_LIMIT)
      }
    }

    if (donations.length === 0) {
      console.log(`   ℹ️  Aucune nouvelle donation`)
      stats.consecutiveErrors = 0
      return
    }

    console.log(`   📥 ${donations.length} donation(s) récupérée(s)`)

    // Sauvegarder en base
    const savedCount = await saveDonations(donations)
    stats.totalSynced += savedCount

    // Mettre à jour le timestamp de la dernière donation
    if (donations.length > 0) {
      const latestTimestamp = Math.max(
        ...donations.map(d => parseInt(d.created_at) * 1000)
      )
      stats.lastDonationTimestamp = latestTimestamp
    }

    stats.lastSyncTime = Date.now()
    stats.consecutiveErrors = 0

    console.log(`   ✅ ${savedCount} donation(s) sauvegardée(s) (Total: ${stats.totalSynced})`)

    // Afficher quelques exemples
    if (savedCount > 0 && donations.length <= 5) {
      donations.forEach(d => {
        const campus = parseCampusFromMessage(d.message || '')
        const campusDisplay = campus.campusId ? campus.campusName : 'Non identifié'
        console.log(`      • ${d.name}: ${d.amount} ${d.currency} - ${campusDisplay}`)
      })
    }
  } catch (error: any) {
    stats.errors++
    stats.consecutiveErrors++

    console.error('❌ Erreur lors de la synchronisation:', error.message)

    // Si trop d'erreurs consécutives, afficher un warning
    if (stats.consecutiveErrors >= 3) {
      console.warn(`⚠️  ${stats.consecutiveErrors} erreurs consécutives - vérifiez votre configuration`)
    }

    // Si trop d'erreurs, arrêter le worker
    if (stats.consecutiveErrors >= 10) {
      console.error('🛑 Trop d\'erreurs consécutives - arrêt du worker')
      process.exit(1)
    }
  }
}

/**
 * Affiche les statistiques du worker
 */
function displayStats(): void {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Statistiques du worker')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   📥 Total synchronisé: ${stats.totalSynced} donations`)
  console.log(`   ⏰ Dernière sync: ${stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleString() : 'Jamais'}`)
  console.log(`   🕐 Dernière donation: ${stats.lastDonationTimestamp ? new Date(stats.lastDonationTimestamp).toLocaleString() : 'Aucune'}`)
  console.log(`   ❌ Erreurs totales: ${stats.errors}`)
  console.log(`   🔄 Prochain cycle: ${POLL_INTERVAL / 1000}s`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log('🚀 Démarrage du worker de synchronisation des donations\n')
  console.log(`📡 Intervalle de polling: ${POLL_INTERVAL / 1000}s`)
  console.log(`📊 Limite initiale: ${INITIAL_FETCH_LIMIT} donations\n`)

  // Vérifier la connexion à la base
  try {
    const testResult = await sql`SELECT 1 as test`
    if (testResult.length === 0) {
      throw new Error('Connexion à la base échouée')
    }
    console.log('✅ Connexion à PostgreSQL établie\n')
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', error)
    process.exit(1)
  }

  // Première synchronisation immédiate
  console.log('🔄 Synchronisation initiale...')
  await syncDonations()
  displayStats()

  // Lancer le polling
  setInterval(async () => {
    console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Synchronisation...`)
    await syncDonations()

    // Afficher les stats toutes les 10 syncs
    if (stats.totalSynced > 0 && stats.totalSynced % 10 === 0) {
      displayStats()
    }
  }, POLL_INTERVAL)

  // Gérer la fermeture gracieuse
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du worker...')
    displayStats()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Arrêt du worker...')
    displayStats()
    process.exit(0)
  })

  console.log('✅ Worker démarré - Synchronisation en cours...')
  console.log('   Appuyez sur Ctrl+C pour arrêter\n')
}

// Lancer le worker
main().catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})
