/**
 * Système de cache en mémoire pour les donations
 * Évite de surcharger l'API Streamlabs
 *
 * Sécurité :
 * - Cache en lecture seule
 * - Pas de modification possible des données
 * - Rafraîchissement automatique
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 30 * 1000 // 30 secondes par défaut

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Vérifie si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
  }

  /**
   * Vérifie si une clé existe et est valide
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Récupère les statistiques du cache
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instance singleton du cache
export const cache = new InMemoryCache()

/**
 * Helper pour wraper une fonction avec du cache
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Vérifie le cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Récupère les données
  const data = await fetcher()

  // Met en cache
  cache.set(key, data, ttl)

  return data
}
