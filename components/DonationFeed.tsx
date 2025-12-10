'use client'

import { useEffect, useState } from 'react'

interface Donation {
  id: string
  name: string
  message: string
  amount: number
  currency: string
  timestamp: number
  campus: {
    campusName: string | null
    confidence: string
  }
}

export default function DonationFeed() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('/api/donations?limit=10')
        const result = await response.json()

        if (result.success) {
          setDonations(result.data)
        }
      } catch (err) {
        console.error('Error fetching donations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()

    // Rafraîchit toutes les 10 secondes
    const interval = setInterval(fetchDonations, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des donations...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💝 Dernières donations</h2>

      <div style={styles.feed}>
        {donations.length === 0 ? (
          <div style={styles.empty}>Aucune donation pour le moment</div>
        ) : (
          donations.map((donation, index) => (
            <div
              key={donation.id}
              style={{
                ...styles.donationCard,
                animationDelay: `${index * 0.05}s`
              }}
              className="animate-slide-in"
            >
              <div style={styles.donationHeader}>
                <span style={styles.donorName}>{donation.name}</span>
                <span style={styles.donationAmount}>
                  {donation.amount.toFixed(2)} {donation.currency}
                </span>
              </div>

              {donation.message && (
                <div style={styles.donationMessage}>{donation.message}</div>
              )}

              <div style={styles.donationFooter}>
                {donation.campus.campusName ? (
                  <span style={styles.campusBadge}>
                    📍 {donation.campus.campusName}
                  </span>
                ) : (
                  <span style={styles.noCampus}>
                    Campus non identifié
                  </span>
                )}
                <span style={styles.timestamp}>
                  {new Date(donation.timestamp * 1000).toLocaleTimeString('fr-FR')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,

  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
    marginBottom: 'var(--spacing-lg)',
    textAlign: 'center',
  } as React.CSSProperties,

  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    maxHeight: '600px',
    overflowY: 'auto',
  } as React.CSSProperties,

  donationCard: {
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    borderLeft: '4px solid var(--orange-primary)',
  } as React.CSSProperties,

  donationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)',
  } as React.CSSProperties,

  donorName: {
    fontWeight: 'bold',
    color: 'var(--white)',
    fontSize: '1rem',
  } as React.CSSProperties,

  donationAmount: {
    fontWeight: 'bold',
    color: 'var(--orange-light)',
    fontSize: '1.125rem',
  } as React.CSSProperties,

  donationMessage: {
    color: 'var(--white)',
    opacity: 0.9,
    fontSize: '0.875rem',
    marginBottom: 'var(--spacing-sm)',
    lineHeight: '1.4',
  } as React.CSSProperties,

  donationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  } as React.CSSProperties,

  campusBadge: {
    backgroundColor: 'var(--orange-primary)',
    color: 'var(--white)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 'bold',
  } as React.CSSProperties,

  noCampus: {
    color: 'var(--white)',
    opacity: 0.5,
  } as React.CSSProperties,

  timestamp: {
    color: 'var(--white)',
    opacity: 0.5,
  } as React.CSSProperties,

  loading: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,

  empty: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,
}
