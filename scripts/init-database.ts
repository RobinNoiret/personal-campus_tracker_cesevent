/**
 * Script d'initialisation de la base de données PostgreSQL (Neon)
 *
 * Ce script:
 * - Vérifie la connexion à Neon
 * - Exécute le schéma SQL pour créer les tables, index et vues
 * - Affiche les statistiques de la base
 *
 * Usage:
 *   npm run init-db
 */

// IMPORTANT: Charger les variables d'environnement AVANT les imports
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// Maintenant importer les modules qui dépendent des variables d'environnement
import { readFileSync } from 'fs'
import { sql, testConnection, initializeSchema } from '@/lib/db/neon'
import { countDonations, getGlobalStats } from '@/lib/db/donations'

async function initDatabase() {
  console.log('🚀 Initialisation de la base de données PostgreSQL (Neon)...\n')

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣  Vérification de la connexion...')
    const isConnected = await testConnection()

    if (!isConnected) {
      throw new Error('Impossible de se connecter à Neon Database')
    }
    console.log('✅ Connexion établie avec succès\n')

    // 2. Charger le schéma SQL
    console.log('2️⃣  Chargement du schéma SQL...')
    const schemaPath = resolve(process.cwd(), 'lib/db/schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')
    console.log(`   Schema chargé: ${schemaPath}\n`)

    // 3. Exécuter le schéma
    console.log('3️⃣  Exécution du schéma SQL...')
    console.log('   (création des tables, index, vues et triggers)')

    await initializeSchema(schemaSQL)
    console.log('✅ Schéma exécuté avec succès\n')

    // 4. Vérifier les tables créées
    console.log('4️⃣  Vérification des tables...')
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    console.log(`   Tables trouvées: ${tables.length}`)
    tables.forEach((table: any) => console.log(`   - ${table.tablename}`))
    console.log()

    // 5. Vérifier les vues
    console.log('5️⃣  Vérification des vues...')
    const views = await sql`
      SELECT viewname
      FROM pg_views
      WHERE schemaname = 'public'
      ORDER BY viewname
    `
    console.log(`   Vues trouvées: ${views.length}`)
    views.forEach((view: any) => console.log(`   - ${view.viewname}`))
    console.log()

    // 6. Vérifier les index
    console.log('6️⃣  Vérification des index...')
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'donations'
      ORDER BY indexname
    `
    console.log(`   Index sur 'donations': ${indexes.length}`)
    indexes.forEach((idx: any) => console.log(`   - ${idx.indexname}`))
    console.log()

    // 7. Statistiques
    console.log('7️⃣  Statistiques de la base...')
    const donationCount = await countDonations()
    console.log(`   📊 Donations enregistrées: ${donationCount}`)

    if (donationCount > 0) {
      const stats = await getGlobalStats()
      console.log(`   💰 Montant total: ${stats.total_amount.toFixed(2)} EUR`)
      console.log(`   📈 Moyenne: ${stats.average_amount.toFixed(2)} EUR`)
      console.log(`   🏫 Nombre de campus: ${stats.campus_count}`)
      console.log(`   ❓ Non identifiés: ${stats.unidentified_count} (${stats.unidentified_amount.toFixed(2)} EUR)`)
    }
    console.log()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Base de données initialisée avec succès!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('📝 Prochaines étapes:')
    console.log('   1. Lancez votre application: npm run dev')
    console.log('   2. Les donations seront automatiquement sauvegardées')
    console.log('   3. Utilisez /api/donations?fromDb=true pour lire depuis PostgreSQL')
    console.log('   4. Utilisez /api/export pour exporter les données')
    console.log()
    console.log('💡 Commandes SQL utiles:')
    console.log('   - SELECT * FROM donations ORDER BY timestamp DESC LIMIT 10;')
    console.log('   - SELECT * FROM campus_stats;')
    console.log('   - SELECT * FROM global_stats;')
    console.log()

    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    process.exit(1)
  }
}

// Lancer l'initialisation
initDatabase()
