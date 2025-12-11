'use client'

import { useEffect, useState } from 'react'

interface CampusData {
  campusId: string
  campusName: string
  totalAmount: number
  donationCount: number
}

interface LeaderboardData {
  leaderboard: CampusData[]
  stats: {
    totalAmount: number
    totalDonations: number
    campusCount: number
    unidentified: {
      count: number
      amount: number
    }
  }
}

export default function LeaderboardCard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()

    // Rafraîchit toutes les 30 secondes
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Erreur: {error}</div>
      </div>
    )
  }

  // Filtre les campus avec au moins une donation
  const activeCampus = data.leaderboard.filter(c => c.donationCount > 0)

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Classement des Campus</h2>
      </div>

      <div style={styles.leaderboard}>
        {activeCampus.length === 0 ? (
          <div style={styles.empty}>Aucune donation identifiée pour le moment</div>
        ) : (
          activeCampus.map((campus, index) => {
            const isTopThree = index < 3
            let borderColor = 'transparent'
            let rankColor = 'var(--white)'

            if (index === 0) {
              borderColor = 'var(--orange-primary)'
              rankColor = 'var(--orange-primary)'
            } else if (index === 1) {
              borderColor = 'var(--orange-light)'
              rankColor = 'var(--orange-light)'
            } else if (index === 2) {
              borderColor = 'var(--orange-pale)'
              rankColor = 'var(--orange-pale)'
            }

            return (
              <div
                key={campus.campusId}
                style={{
                  ...styles.campusRow,
                  ...(isTopThree ? {
                    ...styles.topThreeRow,
                    border: `3px solid ${borderColor}`
                  } : {}),
                  animationDelay: `${index * 0.1}s`
                }}
                className="animate-slide-in"
              >
                <div style={{
                  ...styles.rankBadge,
                  ...(isTopThree ? {
                    ...styles.topThreeRank,
                    color: rankColor
                  } : {})
                }}>
                  #{index + 1}
                </div>

                <div style={styles.campusInfo}>
                  <div style={styles.campusName}>{campus.campusName}</div>
                  <div style={styles.campusStats}>
                    {campus.donationCount} donation{campus.donationCount > 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{
                  ...styles.campusAmount,
                  ...(isTopThree ? styles.topThreeAmount : {})
                }}>
                  {parseFloat(String(campus.totalAmount || 0)).toFixed(2)} €
                </div>
              </div>
            )
          })
        )}
      </div>

      {data.stats.unidentified.count > 0 && (
        <div style={styles.footer}>
          <span style={styles.unidentified}>
            {data.stats.unidentified.count} donation(s) non identifiée(s) -{' '}
            {parseFloat(String(data.stats.unidentified.amount || 0)).toFixed(2)} €
          </span>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(1rem, 3vw, 2rem)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    marginBottom: 'clamp(1rem, 3vw, 2rem)',
  } as React.CSSProperties,

  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
    textAlign: 'center',
  } as React.CSSProperties,

  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(0.5rem, 2vw, 1rem)',
  } as React.CSSProperties,

  campusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(0.5rem, 2vw, 1rem)',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  } as React.CSSProperties,

  topThreeRow: {
    boxShadow: '0 4px 12px rgba(211, 97, 78, 0.2)',
  } as React.CSSProperties,

  rankBadge: {
    fontSize: 'clamp(1rem, 3vw, 1.5rem)',
    width: 'clamp(35px, 8vw, 50px)',
    textAlign: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  } as React.CSSProperties,

  topThreeRank: {
    color: 'var(--orange-primary)',
    fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
  } as React.CSSProperties,

  campusInfo: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  campusName: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 'bold',
    color: 'var(--white)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  campusStats: {
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    color: 'var(--white)',
    opacity: 0.7,
    marginTop: 'var(--spacing-xs)',
  } as React.CSSProperties,

  campusAmount: {
    fontSize: 'clamp(1rem, 3vw, 1.5rem)',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  topThreeAmount: {
    fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
    color: 'var(--orange-light)',
  } as React.CSSProperties,

  footer: {
    marginTop: 'clamp(0.75rem, 2vw, 1.5rem)',
    paddingTop: 'clamp(0.75rem, 2vw, 1.5rem)',
    borderTop: '1px solid var(--grey-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,

  unidentified: {
    textAlign: 'center',
  } as React.CSSProperties,

  hint: {
    textAlign: 'center',
    color: 'var(--orange-pale)',
  } as React.CSSProperties,

  loading: {
    textAlign: 'center',
    padding: 'clamp(1rem, 3vw, 2rem)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,

  error: {
    textAlign: 'center',
    padding: 'clamp(1rem, 3vw, 2rem)',
    color: 'var(--orange-primary)',
  } as React.CSSProperties,

  empty: {
    textAlign: 'center',
    padding: 'clamp(1rem, 3vw, 2rem)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,
}
