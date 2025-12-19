'use client'

import { useEffect, useState } from 'react'

interface LeaderboardData {
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

export default function StatsCard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Rafraîchit toutes les 60 secondes
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return null
  }

  const totalAmount = parseFloat(String(data.stats.totalAmount || 0))
  const totalDonations = parseInt(String(data.stats.totalDonations || 0))
  const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.statsGrid}>
        <div style={styles.statWithBorder}>
          <span style={styles.statValue}>{totalAmount.toFixed(2)} €</span>
          <span style={styles.statLabel}>Total collecté</span>
        </div>
        <div style={styles.statWithBorder}>
          <span style={styles.statValue}>{totalDonations}</span>
          <span style={styles.statLabel}>Donations</span>
        </div>
        <div style={styles.statWithBorder}>
          <span style={styles.statValue}>{averageDonation.toFixed(2)} €</span>
          <span style={styles.statLabel}>Don moyen</span>
        </div>
      </div>
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
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 'clamp(0.75rem, 2vw, 1.5rem)',
  } as React.CSSProperties,

  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(0.75rem, 2vw, 1.5rem)',
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,

  statWithBorder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(0.75rem, 2vw, 1.5rem)',
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    border: '3px solid var(--orange-primary)',
    boxShadow: '0 4px 12px rgba(211, 97, 78, 0.2)',
  } as React.CSSProperties,

  statValue: {
    fontSize: 'clamp(1.25rem, 4vw, 2rem)',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
    marginBottom: 'var(--spacing-sm)',
  } as React.CSSProperties,

  statLabel: {
    fontSize: 'clamp(0.8rem, 2vw, 1rem)',
    color: 'var(--white)',
    opacity: 0.8,
    textAlign: 'center',
  } as React.CSSProperties,
}
