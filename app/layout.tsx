import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "CES'Event Campus Tracker",
  description: 'Suivez les donations par campus pour le CES\'Event',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
