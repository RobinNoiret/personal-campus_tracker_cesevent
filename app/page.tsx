import LeaderboardCard from '@/components/LeaderboardCard'
import DonationFeed from '@/components/DonationFeed'

export default function HomePage() {
  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>CES'Event 2025</h1>
        <p style={styles.subtitle}>
          Suivez en temps réel les donations par campus
        </p>
      </header>

      <div style={styles.content}>
        <div style={styles.section}>
          <LeaderboardCard />
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          💡 Pour que votre donation soit comptabilisée, ajoutez le hashtag de votre campus dans votre message
        </p>
        <p style={styles.footerSubtext}>
          Exemples : #Paris #Lyon #Nanterre #Bordeaux...
        </p>
      </footer>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    padding: 'var(--spacing-xl)',
    backgroundColor: 'var(--black)',
  } as React.CSSProperties,

  header: {
    textAlign: 'center',
    marginBottom: 'var(--spacing-xl)',
    paddingTop: 'var(--spacing-xl)',
  } as React.CSSProperties,

  mainTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, var(--orange-primary) 0%, var(--orange-light) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 'var(--spacing-md)',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--white)',
    opacity: 0.8,
  } as React.CSSProperties,

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,

  section: {
    width: '100%',
  } as React.CSSProperties,

  footer: {
    marginTop: 'var(--spacing-xl)',
    paddingTop: 'var(--spacing-xl)',
    textAlign: 'center',
    borderTop: '1px solid var(--grey-dark)',
  } as React.CSSProperties,

  footerText: {
    color: 'var(--orange-pale)',
    fontSize: '1rem',
    marginBottom: 'var(--spacing-sm)',
  } as React.CSSProperties,

  footerSubtext: {
    color: 'var(--white)',
    opacity: 0.5,
    fontSize: '0.875rem',
  } as React.CSSProperties,
}
