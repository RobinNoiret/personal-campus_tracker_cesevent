/**
 * Script de test détaillé pour l'API Streamlabs Charity
 */

require('dotenv').config({ path: '.env.local' })

const TEAM_ID = '878941731532444408'
const ACCESS_TOKEN = process.env.STREAMLABS_ACCESS_TOKEN

console.log('🔍 Debug API Streamlabs Charity\n')
console.log('Token présent:', !!ACCESS_TOKEN)
console.log('Token (premiers chars):', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 20) + '...' : 'N/A')
console.log('Team ID:', TEAM_ID)
console.log('\n───────────────────────────────────\n')

async function testAPI() {
  try {
    const url = `https://streamlabscharity.com/api/v1/teams/${TEAM_ID}/donations`

    console.log(`📡 GET ${url}\n`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    })

    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    console.log(`📋 Headers:`)
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`)
    }
    console.log()

    const text = await response.text()
    console.log(`📄 Raw Response (first 500 chars):`)
    console.log(text.substring(0, 500))
    console.log()

    if (response.ok) {
      try {
        const data = JSON.parse(text)
        console.log(`✅ JSON valide`)
        console.log(`📊 Type: ${Array.isArray(data) ? 'Array' : typeof data}`)
        console.log(`📊 Longueur: ${Array.isArray(data) ? data.length : 'N/A'}`)

        if (Array.isArray(data) && data.length > 0) {
          console.log('\n🎯 Première donation:')
          console.log(JSON.stringify(data[0], null, 2))
        }
      } catch (e) {
        console.error('❌ Erreur de parsing JSON:', e.message)
      }
    } else {
      console.error('❌ Erreur HTTP')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error.stack)
  }
}

testAPI()
