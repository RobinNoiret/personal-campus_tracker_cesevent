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
        <h2 style={styles.title}>🏆 Classement des Campus</h2>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{data.stats.totalAmount.toFixed(2)} €</span>
            <span style={styles.statLabel}>Total collecté</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{data.stats.totalDonations}</span>
            <span style={styles.statLabel}>Donations</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{data.stats.campusCount}</span>
            <span style={styles.statLabel}>Campus participants</span>
          </div>
        </div>
      </div>

      <div style={styles.leaderboard}>
        {activeCampus.length === 0 ? (
          <div style={styles.empty}>Aucune donation identifiée pour le moment</div>
        ) : (
          activeCampus.map((campus, index) => (
            <div
              key={campus.campusId}
              style={{
                ...styles.campusRow,
                animationDelay: `${index * 0.1}s`
              }}
              className="animate-slide-in"
            >
              <div style={styles.rankBadge}>
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>

              <div style={styles.campusInfo}>
                <div style={styles.campusName}>{campus.campusName}</div>
                <div style={styles.campusStats}>
                  {campus.donationCount} donation{campus.donationCount > 1 ? 's' : ''}
                </div>
              </div>

              <div style={styles.campusAmount}>
                {campus.totalAmount.toFixed(2)} €
              </div>
            </div>
          ))
        )}
      </div>

      {data.stats.unidentified.count > 0 && (
        <div style={styles.footer}>
          <span style={styles.unidentified}>
            {data.stats.unidentified.count} donation(s) non identifiée(s) -{' '}
            {data.stats.unidentified.amount.toFixed(2)} €
          </span>
          <span style={styles.hint}>
            💡 Pensez à ajouter le hashtag de votre campus !
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
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
    marginBottom: 'var(--spacing-lg)',
    textAlign: 'center',
  } as React.CSSProperties,

  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    flex: 1,
  } as React.CSSProperties,

  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--orange-light)',
  } as React.CSSProperties,

  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--white)',
    opacity: 0.7,
    marginTop: 'var(--spacing-xs)',
  } as React.CSSProperties,

  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  campusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  } as React.CSSProperties,

  rankBadge: {
    fontSize: '1.5rem',
    width: '50px',
    textAlign: 'center',
    fontWeight: 'bold',
  } as React.CSSProperties,

  campusInfo: {
    flex: 1,
  } as React.CSSProperties,

  campusName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--white)',
  } as React.CSSProperties,

  campusStats: {
    fontSize: '0.875rem',
    color: 'var(--white)',
    opacity: 0.7,
    marginTop: 'var(--spacing-xs)',
  } as React.CSSProperties,

  campusAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
  } as React.CSSProperties,

  footer: {
    marginTop: 'var(--spacing-lg)',
    paddingTop: 'var(--spacing-lg)',
    borderTop: '1px solid var(--grey-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    fontSize: '0.875rem',
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
    padding: 'var(--spacing-xl)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,

  error: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--orange-primary)',
  } as React.CSSProperties,

  empty: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--white)',
    opacity: 0.7,
  } as React.CSSProperties,
}
