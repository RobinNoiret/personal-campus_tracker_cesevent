/**
 * Script de test pour vérifier la nouvelle API Streamlabs Charity
 * Usage: node scripts/test-api.js
 */

require('dotenv').config({ path: '.env.local' })

const TEAM_ID = '878941731532444408'
const ACCESS_TOKEN = process.env.STREAMLABS_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ STREAMLABS_ACCESS_TOKEN manquant dans .env.local')
  process.exit(1)
}

async function testAPI() {
  console.log('🔍 Test de l\'API Streamlabs Charity...\n')

  try {
    const url = `https://streamlabscharity.com/api/v1/teams/${TEAM_ID}/donations?page=1&per_page=5`

    console.log(`📡 Requête vers: ${url}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    })

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur API:', errorText)
      return
    }

    const data = await response.json()

    console.log(`✅ ${data.length} donations récupérées\n`)

    if (data.length > 0) {
      console.log('📋 Exemple de donation:')
      const firstDonation = data[0]
      console.log('─────────────────────────────────')
      console.log(`ID: ${firstDonation.id}`)
      console.log(`Donation ID: ${firstDonation.donation.id}`)
      console.log(`Nom: ${firstDonation.donation.display_name}`)
      console.log(`Montant: ${firstDonation.donation.team_amount / 100}€`)
      console.log(`Message: ${firstDonation.donation.comment?.text || 'Pas de message'}`)
      console.log(`Date: ${firstDonation.donation.created_at}`)
      console.log(`Membre: ${firstDonation.member.user.display_name}`)
      console.log('─────────────────────────────────\n')

      // Vérifier que les montants sont bien en centimes
      console.log('💰 Vérification des montants (doivent être en centimes):')
      data.slice(0, 3).forEach((item, i) => {
        const centimes = item.donation.team_amount
        const euros = centimes / 100
        console.log(`  ${i + 1}. ${centimes} centimes = ${euros}€`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testAPI()
