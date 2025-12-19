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
  }
}

export default function OverlayPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [topCampus, setTopCampus] = useState<CampusData[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (result.success) {
          setData(result.data)
          // Prend les 3 premiers campus avec au moins une donation
          const top = result.data.leaderboard
            .filter((c: CampusData) => c.donationCount > 0)
            .slice(0, 3)
          setTopCampus(top)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      }
    }

    fetchLeaderboard()

    // Rafraîchit toutes les 60 secondes
    const interval = setInterval(fetchLeaderboard, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!data || topCampus.length === 0) {
    return null
  }

  return (

      <div style={styles.podium}>
        {topCampus.map((campus, index) => (
          <div
            key={campus.campusId}
            style={{
              ...styles.podiumItem,
              animationDelay: `${index * 0.2}s`,
            }}
            className="animate-fade-in"
          >
            <div style={styles.rank}>
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
            </div>
            <div style={styles.campusName}>{campus.campusName}</div>
            <div style={styles.campusAmount}>{campus.totalAmount.toFixed(0)}€</div>
          </div>
        ))}
      </div>
  )
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,

  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  } as React.CSSProperties,

  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#d3614e',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    marginBottom: '1rem',
  } as React.CSSProperties,

  totalAmount: {
    fontSize: '1.5rem',
    color: '#ffffff',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  } as React.CSSProperties,

  podium: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '500px',
  } as React.CSSProperties,

  podiumItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderRadius: '1rem',
    border: '2px solid #d3614e',
    boxShadow: '0 4px 20px rgba(211, 97, 78, 0.3)',
  } as React.CSSProperties,

  rank: {
    fontSize: '2.5rem',
    width: '60px',
    textAlign: 'center',
  } as React.CSSProperties,

  campusName: {
    flex: 1,
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#ffffff',
  } as React.CSSProperties,

  campusAmount: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#e87d68',
  } as React.CSSProperties,
}
