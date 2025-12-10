/**
 * Script utilitaire pour tester le parsing de messages
 * Usage: npx tsx scripts/test-parsing.ts "Votre message ici #Campus"
 */

import { parseCampusFromMessage } from '../lib/campus/parser'
import { getAllCampusIds, getCampusConfig } from '../lib/campus/config'

const message = process.argv[2]

if (!message) {
  console.log('Veuillez fournir un message à tester')
  console.log('Usage: npx tsx scripts/test-parsing.ts "Votre message ici #Campus"')
  console.log('\nExemples:')
  console.log('  npx tsx scripts/test-parsing.ts "Go Paris ! #Paris"')
  console.log('  npx tsx scripts/test-parsing.ts "Allez Lyon #lyon"')
  process.exit(1)
}

console.log('Test de parsing de message\n')
console.log(`Message : "${message}"\n`)

const result = parseCampusFromMessage(message)

console.log('Résultat :')
console.log(`  Campus ID: ${result.campusId || 'Non identifié'}`)
console.log(`  Campus Name: ${result.campusName || 'Non identifié'}`)
console.log(`  Confidence: ${result.confidence}`)
console.log(`  Matched on: ${result.matchedOn}`)

if (result.campusId) {
  console.log('\nCampus identifié avec succès !')
} else {
  console.log('\nCampus non identifié')
  console.log('\nAssurez-vous d\'utiliser un des hashtags suivants :')

  const allCampus = getAllCampusIds()
  allCampus.forEach(campusId => {
    const config = getCampusConfig(campusId)
    if (config) {
      console.log(`  ${config.name}: ${config.hashtags.join(', ')}`)
    }
  })
}
