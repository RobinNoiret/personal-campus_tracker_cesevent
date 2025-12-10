/**
 * Client de connexion PostgreSQL Neon
 *
 * Utilise @neondatabase/serverless pour une connexion optimisée
 * Compatible avec Vercel Edge Runtime
 */

import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless'
import { Pool } from '@neondatabase/serverless'

// Configuration pour Vercel Edge
neonConfig.fetchConnectionCache = true

let sqlClient: NeonQueryFunction<false, false> | null = null

/**
 * Récupère le client SQL (lazy initialization)
 * Le client n'est créé qu'à la première utilisation
 */
function getSqlClient(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be defined in environment variables')
    }
    sqlClient = neon(process.env.DATABASE_URL)
  }
  return sqlClient
}

/**
 * Client SQL Neon
 * Utilise HTTP pour être compatible avec Edge Runtime
 *
 * Wrapper qui initialise le client à la première utilisation
 */
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  const client = getSqlClient()
  return client(strings, ...values)
}) as NeonQueryFunction<false, false>

/**
 * Teste la connexion à la base de données
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`
    return result.length > 0
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

/**
 * Exécute le schéma SQL pour initialiser la base
 */
export async function initializeSchema(schemaSQL: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be defined in environment variables')
  }

  // Utiliser Pool pour l'initialisation car il supporte mieux les commandes multiples
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    // Nettoyer et normaliser le schéma SQL
    let cleanedSQL = schemaSQL
      // Supprimer les commentaires de ligne
      .replace(/--[^\n]*/g, '')
      // Supprimer les commentaires multi-lignes
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Normaliser les espaces
      .trim()

    // Split le schéma en commandes individuelles
    // On doit gérer les cas comme CREATE FUNCTION qui contiennent des ; internes
    const statements: string[] = []
    let currentStatement = ''
    let inFunction = false
    let dollarQuoteTag = ''

    const lines = cleanedSQL.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()

      // Détecter le début d'une fonction (CREATE ... FUNCTION ou CREATE ... TRIGGER)
      if (trimmedLine.match(/^CREATE(\s+OR\s+REPLACE)?\s+(FUNCTION|TRIGGER)/i)) {
        inFunction = true
      }

      // Détecter les dollar quotes ($$)
      const dollarMatch = trimmedLine.match(/\$(\w*)\$/g)
      if (dollarMatch) {
        for (const match of dollarMatch) {
          if (!dollarQuoteTag) {
            dollarQuoteTag = match
          } else if (match === dollarQuoteTag) {
            dollarQuoteTag = ''
          }
        }
      }

      currentStatement += line + '\n'

      // Un statement se termine par ; seulement si on n'est pas dans une fonction ou dollar quote
      if (trimmedLine.endsWith(';') && !inFunction && !dollarQuoteTag) {
        const stmt = currentStatement.trim()
        if (stmt.length > 0) {
          statements.push(stmt)
        }
        currentStatement = ''
      }

      // Détecter la fin d'une fonction
      if (inFunction && trimmedLine.endsWith(';') && !dollarQuoteTag) {
        inFunction = false
      }
    }

    // Ajouter le dernier statement s'il existe
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim())
    }

    let statementIndex = 0
    for (const statement of statements) {
      if (statement) {
        try {
          statementIndex++
          // Debug: afficher les premiers caractères de chaque statement
          const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
          console.log(`   [${statementIndex}/${statements.length}] ${preview}...`)

          // Exécuter le statement via le pool
          await pool.query(statement)
        } catch (err: any) {
          // Ignorer les erreurs "already exists" lors de la création
          if (!err.message?.includes('already exists')) {
            console.error(`   ❌ Error at statement ${statementIndex}:`, err.message)
            throw err
          } else {
            console.log(`   ⚠️  Already exists, skipping`)
          }
        }
      }
    }

    console.log('✅ Schema initialized successfully')
  } catch (error) {
    console.error('Error initializing schema:', error)
    throw error
  } finally {
    // Fermer le pool après utilisation
    await pool.end()
  }
}
