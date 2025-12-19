/**
 * Script de test pour l'API publique Streamlabs Charity (sans auth)
 */

const TEAM_ID = '878941731532444408'

async function testAPI() {
  console.log('🔍 Test de l\'API Streamlabs Charity (sans auth)...\n')

  try {
    const url = `https://streamlabscharity.com/api/v1/teams/${TEAM_ID}/donations`

    console.log(`📡 Requête vers: ${url}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
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
      console.log('📋 Premières donations:')
      data.slice(0, 3).forEach((item, i) => {
        console.log(`\n─── Donation ${i + 1} ───`)
        console.log(`ID: ${item.id}`)
        console.log(`Donation ID: ${item.donation.id}`)
        console.log(`Nom: ${item.donation.display_name}`)
        console.log(`Montant brut: ${item.donation.team_amount} centimes`)
        console.log(`Montant converti: ${item.donation.team_amount / 100}€`)
        console.log(`Message: ${item.donation.comment?.text || 'Pas de message'}`)
        console.log(`Date: ${item.donation.created_at}`)
        console.log(`Membre: ${item.member.user.display_name}`)
      })

      console.log('\n\n💰 Résumé des montants:')
      const total = data.reduce((sum, item) => sum + item.donation.team_amount, 0) / 100
      console.log(`Total: ${total}€`)
      console.log(`Moyenne: ${(total / data.length).toFixed(2)}€`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testAPI()
