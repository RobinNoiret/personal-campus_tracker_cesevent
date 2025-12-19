import type { StreamlabsCharityApiResponse, StreamlabsCharityDonationItem, NormalizedDonation } from './types'
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
  private readonly teamId = '878941731532444408'
  private readonly baseUrl = `https://streamlabscharity.com/api/v1/teams/${this.teamId}`

  constructor() {
    // L'API Streamlabs Charity est publique, pas besoin d'authentification
  }

  /**
   * Récupère toutes les donations depuis Streamlabs Charity
   * L'API retourne toutes les donations d'un coup (pas de pagination)
   */
  async getDonations(): Promise<StreamlabsCharityDonationItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/donations`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Streamlabs Charity API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: StreamlabsCharityDonationItem[] = await response.json()

      return data
    } catch (error) {
      console.error('Error fetching donations from Streamlabs Charity:', error)
      throw error
    }
  }

  /**
   * Récupère toutes les donations depuis un timestamp donné
   */
  async getAllDonationsSince(sinceTimestamp: number): Promise<NormalizedDonation[]> {
    const items = await this.getDonations()

    // Normaliser les donations
    const normalized = items.map(normalizeDonation)

    // Filtrer uniquement les donations plus récentes que le timestamp
    const newDonations = normalized.filter(d => d.timestamp > sinceTimestamp)

    return newDonations
  }

  /**
   * Récupère toutes les donations
   * @param limit Nombre maximum de donations à récupérer (optionnel)
   */
  async getAllDonations(limit?: number): Promise<NormalizedDonation[]> {
    const items = await this.getDonations()
    const normalized = items.map(normalizeDonation)

    // Si on a une limite, on retourne seulement les X dernières
    if (limit && normalized.length > limit) {
      return normalized.slice(0, limit)
    }

    return normalized
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
