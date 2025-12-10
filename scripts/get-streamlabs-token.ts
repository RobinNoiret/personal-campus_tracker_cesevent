/**
 * Script d'aide pour obtenir un Access Token Streamlabs via OAuth2
 *
 * Ce script démarre un serveur local qui gère le flux OAuth2 avec Streamlabs.
 *
 * Prérequis:
 * 1. Avoir un Client ID et Client Secret de Streamlabs
 * 2. Avoir configuré l'URL de redirection sur https://streamlabs.com/dashboard#/settings/api-settings
 *    Exemple: http://localhost:3333/callback
 *
 * Utilisation:
 * 1. Ajoutez vos credentials dans .env.local:
 *    STREAMLABS_CLIENT_ID=votre_client_id
 *    STREAMLABS_CLIENT_SECRET=votre_client_secret
 *
 * 2. Lancez le script:
 *    npx tsx scripts/get-streamlabs-token.ts
 *
 * 3. Ouvrez votre navigateur à l'URL indiquée
 * 4. Autorisez l'application
 * 5. Le token sera affiché dans la console
 */

import * as http from 'http'
import * as url from 'url'
import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const PORT = 3333
const REDIRECT_URI = `http://localhost:${PORT}/callback`

// Lire les variables d'environnement
const CLIENT_ID = process.env.STREAMLABS_CLIENT_ID
const CLIENT_SECRET = process.env.STREAMLABS_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Erreur: STREAMLABS_CLIENT_ID et STREAMLABS_CLIENT_SECRET doivent être définis')
  console.error('\nAjoutez-les dans votre fichier .env.local:')
  console.error('STREAMLABS_CLIENT_ID=votre_client_id')
  console.error('STREAMLABS_CLIENT_SECRET=votre_client_secret')
  process.exit(1)
}

console.log('🚀 Démarrage du serveur OAuth...\n')

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true)

  if (parsedUrl.pathname === '/') {
    // Page d'accueil - redirige vers Streamlabs OAuth
    const authUrl = new URL('https://streamlabs.com/api/v2.0/authorize')
    authUrl.searchParams.append('client_id', CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'donations.read')

    res.writeHead(302, { Location: authUrl.toString() })
    res.end()
  }
  else if (parsedUrl.pathname === '/callback') {
    // Callback OAuth - échange le code contre un token
    const code = parsedUrl.query.code as string

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>❌ Erreur: Aucun code reçu</h1>')
      return
    }

    try {
      // Échanger le code contre un access token
      const tokenUrl = new URL('https://streamlabs.com/api/v2.0/token')
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code
      })

      const response = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString()
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur API Streamlabs: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const data = await response.json()

      // Afficher le token
      console.log('\n✅ Token obtenu avec succès!\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Access Token:')
      console.log(data.access_token)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      console.log('Ajoutez ce token dans votre fichier .env:')
      console.log(`STREAMLABS_ACCESS_TOKEN=${data.access_token}\n`)

      if (data.refresh_token) {
        console.log('Refresh Token (optionnel, pour renouveler le token):')
        console.log(data.refresh_token)
        console.log()
      }

      // Réponse HTML
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>✅ Token Obtenu</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Token obtenu avec succès!</h1>
            <p>Copiez ce token dans votre fichier <code>.env</code>:</p>
            <pre>STREAMLABS_ACCESS_TOKEN=${data.access_token}</pre>
            <p>Vous pouvez fermer cette fenêtre et arrêter le serveur (Ctrl+C dans le terminal).</p>
          </div>
        </body>
        </html>
      `)

      // Arrêter le serveur après 5 secondes
      setTimeout(() => {
        console.log('🛑 Arrêt du serveur...')
        server.close()
        process.exit(0)
      }, 5000)

    } catch (error) {
      console.error('❌ Erreur lors de l\'échange du code:', error)
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`<h1>❌ Erreur</h1><pre>${error}</pre>`)
    }
  }
  else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 Instructions:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`1. Assurez-vous que l'URL de redirection est configurée sur Streamlabs:`)
  console.log(`   ${REDIRECT_URI}`)
  console.log(`   (https://streamlabs.com/dashboard#/settings/api-settings)`)
  console.log()
  console.log(`2. Ouvrez votre navigateur à cette URL:`)
  console.log(`   http://localhost:${PORT}`)
  console.log()
  console.log(`3. Autorisez l'application`)
  console.log(`4. Le token sera affiché ici et dans votre navigateur`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
})
