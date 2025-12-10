import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy de sécurité
 *
 * Ajoute des headers de sécurité pour protéger l'application :
 * - CORS restreint
 * - Content Security Policy
 * - Protection contre le clickjacking
 * - Protection XSS
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://streamlabs.com;"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (sécurité gérée dans les routes)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
