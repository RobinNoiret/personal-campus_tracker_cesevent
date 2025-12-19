import type { StreamlabsCharityDonationItem, NormalizedDonation } from './types'
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
   * Récupère les donations d'une page depuis Streamlabs Charity
   * @param page Numéro de page (commence à 0, max 500 donations par page)
   */
  async getDonationsPage(page: number = 0): Promise<StreamlabsCharityDonationItem[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      const response = await fetch(`${this.baseUrl}/donations?${params.toString()}`, {
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
   * Récupère toutes les donations avec pagination automatique
   */
  async getAllDonationsWithPagination(): Promise<StreamlabsCharityDonationItem[]> {
    const allItems: StreamlabsCharityDonationItem[] = []
    let page = 0
    const maxPages = 100 // Limite de sécurité pour éviter les boucles infinies

    while (page < maxPages) {
      const items = await this.getDonationsPage(page)

      if (items.length === 0) {
        break
      }

      allItems.push(...items)

      // Si on a moins de 500 items, c'est la dernière page
      if (items.length < 500) {
        break
      }

      page++
    }

    return allItems
  }

  /**
   * Récupère toutes les donations depuis un timestamp donné
   */
  async getAllDonationsSince(sinceTimestamp: number): Promise<NormalizedDonation[]> {
    const items = await this.getAllDonationsWithPagination()

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
    const items = await this.getAllDonationsWithPagination()
    const normalized = items.map(normalizeDonation)

    // Si on a une limite, on retourne seulement les X premières
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
