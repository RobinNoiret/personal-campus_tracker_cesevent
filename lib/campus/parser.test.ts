/**
 * Tests pour le parser de campus
 * Pour lancer les tests : npm test (après avoir installé un framework de test)
 */

import { parseCampusFromMessage } from './parser'

// Tests de base
console.log('🧪 Tests de parsing des campus\n')

const testCases = [
  // Tests avec hashtags (confiance haute)
  {
    message: 'Allez Paris ! #Paris',
    expected: { campusId: 'paris', confidence: 'high' },
    description: 'Hashtag Paris majuscule'
  },
  {
    message: 'Go Lyon #lyon',
    expected: { campusId: 'lyon', confidence: 'high' },
    description: 'Hashtag lyon minuscule'
  },
  {
    message: 'Support #NANTERRE',
    expected: { campusId: 'nanterre', confidence: 'high' },
    description: 'Hashtag NANTERRE majuscule'
  },
  {
    message: 'Donation pour le campus #Bordeaux !',
    expected: { campusId: 'bordeaux', confidence: 'high' },
    description: 'Hashtag au milieu du message'
  },

  // Tests avec alias (confiance moyenne)
  {
    message: 'Allez Paris !',
    expected: { campusId: 'paris', confidence: 'medium' },
    description: 'Alias Paris sans hashtag'
  },
  {
    message: 'Je suis de lyon',
    expected: { campusId: 'lyon', confidence: 'medium' },
    description: 'Alias lyon minuscule'
  },

  // Tests négatifs
  {
    message: 'Bonne chance à tous !',
    expected: { campusId: null, confidence: 'low' },
    description: 'Aucun campus identifié'
  },
  {
    message: 'Je suis #etudiant',
    expected: { campusId: null, confidence: 'low' },
    description: 'Hashtag non reconnu'
  },

  // Tests avec multiples hashtags
  {
    message: 'Go campus ! #Lyon #Paris',
    expected: { campusId: 'lyon', confidence: 'high' },
    description: 'Multiples hashtags (prend le premier)'
  },

  // Tests de robustesse
  {
    message: '',
    expected: { campusId: null, confidence: 'low' },
    description: 'Message vide'
  },
]

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = parseCampusFromMessage(testCase.message)
  const success =
    result.campusId === testCase.expected.campusId &&
    result.confidence === testCase.expected.confidence

  if (success) {
    console.log(`✅ Test ${index + 1} : ${testCase.description}`)
    passed++
  } else {
    console.log(`❌ Test ${index + 1} : ${testCase.description}`)
    console.log(`   Message: "${testCase.message}"`)
    console.log(`   Attendu: ${JSON.stringify(testCase.expected)}`)
    console.log(`   Obtenu: ${JSON.stringify({ campusId: result.campusId, confidence: result.confidence })}`)
    failed++
  }
})

console.log(`\n📊 Résultats : ${passed} / ${testCases.length} tests réussis`)

if (failed > 0) {
  console.log(`❌ ${failed} test(s) échoué(s)`)
  process.exit(1)
} else {
  console.log('✅ Tous les tests sont passés !')
  process.exit(0)
}
