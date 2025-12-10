import type { StreamlabsApiResponse, NormalizedDonation } from './types'
import { normalizeDonation } from './types'

/**
 * Client sécurisé pour l'API Streamlabs Charity
 *
 * Sécurité :
 * - Le token est stocké uniquement en variable d'environnement
 * - Jamais exposé côté client
 * - Toutes les requêtes passent par les API routes Next.js
 */

export class StreamlabsClient {
  private readonly accessToken: string
  private readonly baseUrl = 'https://streamlabs.com/api/v2.0'

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.STREAMLABS_ACCESS_TOKEN || ''

    if (!this.accessToken) {
      throw new Error(
        'STREAMLABS_ACCESS_TOKEN is required. Please set it in your .env.local file.'
      )
    }
  }

  /**
   * Récupère les donations depuis Streamlabs
   * @param limit Nombre de donations à récupérer (max 100)
   * @param after Timestamp pour pagination
   */
  async getDonations(limit: number = 100, after?: number): Promise<NormalizedDonation[]> {
    try {
      const params = new URLSearchParams({
        limit: Math.min(limit, 100).toString(),
        currency: 'EUR', // Adapter si nécessaire
      })

      if (after) {
        params.append('after', after.toString())
      }

      const response = await fetch(`${this.baseUrl}/donations?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Streamlabs API error: ${response.status} ${response.statusText}`)
      }

      const data: StreamlabsApiResponse = await response.json()

      // Normalise et retourne les donations
      return data.data.map(normalizeDonation)
    } catch (error) {
      console.error('Error fetching donations from Streamlabs:', error)
      throw error
    }
  }

  /**
   * Récupère toutes les donations depuis un timestamp donné
   */
  async getAllDonationsSince(since: number): Promise<NormalizedDonation[]> {
    const allDonations: NormalizedDonation[] = []
    let after: number | undefined = since

    while (true) {
      const donations = await this.getDonations(100, after)

      if (donations.length === 0) {
        break
      }

      allDonations.push(...donations)

      // Si on a moins de 100 donations, c'est la dernière page
      if (donations.length < 100) {
        break
      }

      // Continue avec le timestamp de la dernière donation
      after = donations[donations.length - 1].timestamp
    }

    return allDonations
  }
}

/**
 * Instance singleton du client (côté serveur uniquement)
 */
let clientInstance: StreamlabsClient | null = null

export function getStreamlabsClient(): StreamlabsClient {
  if (!clientInstance) {
    clientInstance = new StreamlabsClient()
  }
  return clientInstance
}
