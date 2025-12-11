'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import LeaderboardCard from '@/components/LeaderboardCard'
import StatsCard from '@/components/StatsCard'
import InfoCard from '@/components/InfoCard'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

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

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Répartition des donations par campus',
    },
  },
}

export default function HomePage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (result.success) {
          setLeaderboardData(result.data)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du leaderboard:', err)
      }
    }

    fetchLeaderboard()

    // Rafraîchit toutes les 30 secondes
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  // Prépare les données du graphique : Top 5 + Autres
  const getPieData = () => {
    if (!leaderboardData) {
      return {
        labels: [],
        datasets: [{
          label: 'Donations par campus',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        }],
      }
    }

    const sortedCampus = [...leaderboardData.leaderboard]
      .filter(c => c.donationCount > 0)
      .sort((a, b) => parseFloat(String(b.totalAmount)) - parseFloat(String(a.totalAmount)))

    const top5 = sortedCampus.slice(0, 5)
    const others = sortedCampus.slice(5)

    const labels = top5.map(c => c.campusName)
    const data = top5.map(c => parseFloat(String(c.totalAmount)))

    // Déclinaisons de la couleur principale #d3614e (211, 97, 78)
    const colors = [
      'rgba(211, 97, 78, 0.9)',   // #d3614e - Couleur principale
      'rgba(232, 125, 104, 0.9)', // Plus clair
      'rgba(244, 169, 154, 0.9)', // Encore plus clair
      'rgba(191, 77, 58, 0.9)',   // Plus foncé
      'rgba(168, 61, 45, 0.9)',   // Encore plus foncé
    ]

    const borderColors = [
      'rgba(211, 97, 78, 1)',     // #d3614e
      'rgba(232, 125, 104, 1)',
      'rgba(244, 169, 154, 1)',
      'rgba(191, 77, 58, 1)',
      'rgba(168, 61, 45, 1)',
    ]

    // Ajoute la catégorie "Autres" si nécessaire
    if (others.length > 0) {
      const othersTotal = others.reduce((sum, c) => sum + parseFloat(String(c.totalAmount)), 0)
      labels.push('Autres')
      data.push(othersTotal)
      // 6ème déclinaison : version très désaturée et sombre de #d3614e pour "Autres"
      colors.push('rgba(140, 105, 100, 0.6)')
      borderColors.push('rgba(140, 105, 100, 0.9)')
    }

    return {
      labels,
      datasets: [{
        label: 'Donations par campus',
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 1,
        // Garde les mêmes couleurs au hover (pas de changement)
        hoverBackgroundColor: colors.slice(0, labels.length),
        hoverBorderColor: borderColors.slice(0, labels.length),
        hoverBorderWidth: 3,
      }],
    }
  }
  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <Image
          src="/cesevent_logo.png"
          alt="CES'Event Edition 2"
          width={250}
          height={125}
          priority
          style={styles.logo}
        />
      </header>

      <div style={styles.statsSection}>
        <StatsCard />
      </div>

      <div style={styles.bentoGrid}>
        <div style={styles.leaderboardSection} className="leaderboard-section">
          <LeaderboardCard />
        </div>
        <div style={styles.rightColumn} className="right-column">
          <div style={styles.infoSection} className="info-section">
            <InfoCard />
          </div>
          <div style={styles.chartSection} className="chart-section">
            <Pie data={getPieData()} options={pieOptions} />
          </div>
        </div>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    padding: '0 var(--spacing-xl) var(--spacing-xl)',
    backgroundColor: 'var(--black)',
  } as React.CSSProperties,

  header: {
    textAlign: 'center',
    paddingBottom: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  logo: {
    maxWidth: '100%',
    height: 'auto',
  } as React.CSSProperties,

  statsSection: {
    maxWidth: '1600px',
    margin: '0 auto var(--spacing-xl)',
  } as React.CSSProperties,

  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-xl)',
    maxWidth: '1600px',
    margin: '0 auto',
  } as React.CSSProperties,

  leaderboardSection: {
    gridColumn: '1 / 2',
    display: 'flex',
  } as React.CSSProperties,

  rightColumn: {
    gridColumn: '2 / 3',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
    height: '100%',
  } as React.CSSProperties,

  infoSection: {
    width: '100%',
  } as React.CSSProperties,

  chartSection: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-lg)',
  } as React.CSSProperties,
}
