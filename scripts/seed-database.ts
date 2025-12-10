/**
 * Script de seed pour la base de données
 *
 * Insère des données de test réalistes pour simuler des donations
 * de différents campus CES
 *
 * Usage:
 *   npm run seed-db
 */

// IMPORTANT: Charger les variables d'environnement AVANT les imports
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// Maintenant importer les modules
import { sql } from '@/lib/db/neon'
import { parseCampusFromMessage } from '@/lib/campus/parser'

// Données de test basées sur le format Streamlabs
const mockDonations = [
  // Campus identifiables
  {
    donation_id: "80179001",
    created_at: "1438576556",
    currency: "EUR",
    amount: "25.00",
    name: "Alice Martin",
    message: "Go Lyon ! 🦁"
  },
  {
    donation_id: "80179002",
    created_at: "1438576600",
    currency: "EUR",
    amount: "50.00",
    name: "Thomas Bernard",
    message: "Pour Paris, bonne chance !"
  },
  {
    donation_id: "80179003",
    created_at: "1438576650",
    currency: "EUR",
    amount: "15.50",
    name: "Marie Dubois",
    message: "Toulouse on est là 🌸"
  },
  {
    donation_id: "80179004",
    created_at: "1438576700",
    currency: "EUR",
    amount: "100.00",
    name: "Jean Dupont",
    message: "Bordeaux pour la victoire 🍷"
  },
  {
    donation_id: "80179005",
    created_at: "1438576750",
    currency: "EUR",
    amount: "30.00",
    name: "Sophie Leclerc",
    message: "Allez Lille ! 💪"
  },
  {
    donation_id: "80179006",
    created_at: "1438576800",
    currency: "EUR",
    amount: "75.00",
    name: "Pierre Moreau",
    message: "Strasbourg represent 🇫🇷"
  },
  {
    donation_id: "80179007",
    created_at: "1438576850",
    currency: "EUR",
    amount: "20.00",
    name: "Julie Roux",
    message: "RENNES en force 💚"
  },
  {
    donation_id: "80179008",
    created_at: "1438576900",
    currency: "EUR",
    amount: "45.00",
    name: "Lucas Petit",
    message: "NANTES la belle ⚓"
  },
  {
    donation_id: "80179009",
    created_at: "1438576950",
    currency: "EUR",
    amount: "60.00",
    name: "Emma Laurent",
    message: "Nice côte d'azur 🌴"
  },
  {
    donation_id: "80179010",
    created_at: "1438577000",
    currency: "EUR",
    amount: "35.00",
    name: "Hugo Simon",
    message: "Montpellier au top 🌞"
  },
  // Quelques donations avec plusieurs campus mentionnés
  {
    donation_id: "80179011",
    created_at: "1438577050",
    currency: "EUR",
    amount: "55.00",
    name: "Chloé Blanc",
    message: "Lyon et Paris vous gérez !"
  },
  {
    donation_id: "80179012",
    created_at: "1438577100",
    currency: "EUR",
    amount: "40.00",
    name: "Nathan Garnier",
    message: "Toulouse Bordeaux, force à vous"
  },
  // Donations sans campus identifiable
  {
    donation_id: "80179013",
    created_at: "1438577150",
    currency: "EUR",
    amount: "25.00",
    name: "Léa Rousseau",
    message: "Bonne chance à tous ! 🎉"
  },
  {
    donation_id: "80179014",
    created_at: "1438577200",
    currency: "EUR",
    amount: "15.00",
    name: "Alexandre Vincent",
    message: "Super événement !"
  },
  {
    donation_id: "80179015",
    created_at: "1438577250",
    currency: "EUR",
    amount: "80.00",
    name: "Camille Fournier",
    message: ""
  },
  // Quelques grosses donations
  {
    donation_id: "80179016",
    created_at: "1438577300",
    currency: "EUR",
    amount: "200.00",
    name: "Antoine Mercier",
    message: "LYON jusqu'au bout 💙❤️"
  },
  {
    donation_id: "80179017",
    created_at: "1438577350",
    currency: "EUR",
    amount: "150.00",
    name: "Isabelle Lefevre",
    message: "Paris je crois en vous 🗼"
  },
  {
    donation_id: "80179018",
    created_at: "1438577400",
    currency: "EUR",
    amount: "5.00",
    name: "Maxime Girard",
    message: "Toulouse c'est petit mais c'est de tout coeur ❤️"
  },
  // Plus de diversité
  {
    donation_id: "80179019",
    created_at: "1438577450",
    currency: "EUR",
    amount: "90.00",
    name: "Sarah Morel",
    message: "Strasbourg on est avec vous 🥨"
  },
  {
    donation_id: "80179020",
    created_at: "1438577500",
    currency: "EUR",
    amount: "42.00",
    name: "Tom Bonnet",
    message: "LILLE METROPOLE 🔥"
  }
]

async function seedDatabase() {
  console.log('🌱 Seed de la base de données...\n')

  try {
    let successCount = 0
    let errorCount = 0

    for (const donation of mockDonations) {
      try {
        // Parser le campus depuis le message
        const campusInfo = parseCampusFromMessage(donation.message || '')

        // Convertir la confiance en nombre (high=0.9, medium=0.6, low=0.3)
        const confidenceMap = { high: 0.9, medium: 0.6, low: 0.3 }
        const confidenceValue = confidenceMap[campusInfo.confidence]

        // Convertir le timestamp en millisecondes (Streamlabs utilise des secondes)
        const timestamp = parseInt(donation.created_at) * 1000

        // Insérer la donation
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
            ${null},
            ${donation.message || ''},
            ${parseFloat(donation.amount)},
            ${donation.currency},
            ${timestamp},
            ${true},
            ${campusInfo.campusId},
            ${campusInfo.campusName},
            ${confidenceValue}
          )
          ON CONFLICT (id) DO NOTHING
        `

        const campusDisplay = campusInfo.campusId
          ? `${campusInfo.campusName} (${campusInfo.confidence})`
          : 'Non identifié'

        console.log(`✅ ${donation.name} - ${donation.amount} ${donation.currency} - ${campusDisplay}`)
        successCount++
      } catch (err: any) {
        console.error(`❌ Erreur pour ${donation.name}:`, err.message)
        errorCount++
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Seed terminé: ${successCount} donations insérées, ${errorCount} erreurs`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Afficher les statistiques
    console.log('📊 Statistiques de la base:\n')

    const stats = await sql`SELECT * FROM global_stats`
    if (stats.length > 0) {
      const globalStats = stats[0]
      console.log(`   💰 Total: ${globalStats.total_amount} EUR`)
      console.log(`   📊 Nombre de donations: ${globalStats.total_donations}`)
      console.log(`   📈 Moyenne: ${parseFloat(globalStats.average_amount).toFixed(2)} EUR`)
      console.log(`   🏫 Campus identifiés: ${globalStats.campus_count}`)
      console.log(`   ❓ Non identifiés: ${globalStats.unidentified_count} (${parseFloat(globalStats.unidentified_amount).toFixed(2)} EUR)`)
    }

    console.log('\n🏆 Top 3 des campus:\n')
    const campusStats = await sql`
      SELECT * FROM campus_stats
      ORDER BY total_amount DESC
      LIMIT 3
    `
    campusStats.forEach((campus: any, index: number) => {
      console.log(`   ${index + 1}. ${campus.campus_name}: ${parseFloat(campus.total_amount).toFixed(2)} EUR (${campus.donation_count} donations)`)
    })

    console.log('\n💡 Testez maintenant:')
    console.log('   - http://localhost:3000/api/donations?fromDb=true')
    console.log('   - http://localhost:3000/api/leaderboard')
    console.log('   - http://localhost:3000/api/export')
    console.log()

    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  }
}

// Lancer le seed
seedDatabase()
