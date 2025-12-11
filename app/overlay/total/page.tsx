'use client'

import { useEffect, useState } from 'react'

interface LeaderboardData {
  stats: {
    totalAmount: number
    totalDonations: number
  }
}

export default function TotalOverlay() {
  const [data, setData] = useState<LeaderboardData | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    fetchStats()

    // Rafraîchit toutes les 10 secondes
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return null
  }

  const totalAmount = parseFloat(String(data.stats.totalAmount || 0))

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.label}>Cagnotte globale</div>
        <div style={styles.amount}>{totalAmount.toFixed(2)} €</div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,

  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem 2.5rem',
    backgroundColor: '#2a2a2a',
    borderRadius: '1rem',
    border: '3px solid #d3614e',
    boxShadow: '0 4px 20px rgba(211, 97, 78, 0.3)',
  } as React.CSSProperties,

  label: {
    fontSize: '1.25rem',
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontWeight: '600',
  } as React.CSSProperties,

  amount: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#d3614e',
    textAlign: 'center',
    lineHeight: '1',
  } as React.CSSProperties,
}
