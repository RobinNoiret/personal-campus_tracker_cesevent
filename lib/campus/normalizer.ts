/**
 * Normalise une chaîne de caractères pour la comparaison
 * - Convertit en minuscules
 * - Supprime les accents
 * - Supprime les espaces multiples
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ') // Normalise les espaces
    .trim()
}

/**
 * Extrait tous les hashtags d'un texte
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_àâäéèêëïîôöùûüÿæœç]+/gi
  const matches = text.match(hashtagRegex) || []
  return matches.map(tag => normalizeText(tag))
}

/**
 * Nettoie un hashtag (enlève le #)
 */
export function cleanHashtag(hashtag: string): string {
  return hashtag.replace(/^#/, '')
}
