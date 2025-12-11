'use client'

export default function InfoCard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>À propos de l'événement</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.description}>
          <strong>CES'Event</strong> revient pour une <strong>2e édition solidaire</strong> ! 🤝
        </p>

        <div style={styles.eventInfo}>
          <p style={styles.infoLine}>📅 <strong>19 & 20 décembre 2025</strong></p>
          <p style={styles.infoLine}>📍 En direct du campus <strong>CESI Lyon</strong></p>
          <p style={styles.infoLine}>📺 <a href="https://twitch.tv/ces_event" target="_blank" rel="noopener noreferrer" style={styles.link}>twitch.tv/ces_event</a></p>
        </div>

        <p style={styles.description}>
          24h de live, des jeux, des défis, des invités… mais surtout un objectif :
          collecter un maximum de dons pour l'association <strong>Cop1</strong>, qui lutte contre la précarité étudiante 💙
        </p>

        <p style={styles.description}>
          💡 Inspiré du ZEvent, cet événement est organisé par les étudiants du CESI Lyon, avec passion et engagement.
        </p>

        <p style={styles.goal}>
          🎯 <strong>Objectif 2025 :</strong> battre les 540 € récoltés l'an dernier et doubler la visibilité !
        </p>

        <div style={styles.divider} />

        <div style={styles.hashtagSection}>
          <div style={styles.hashtagHeader}>
            <h3 style={styles.hashtagTitle}>Comment participer ?</h3>
          </div>

          <p style={styles.hashtagText}>
            Pour que votre donation soit comptabilisée pour votre campus,
            ajoutez simplement le hashtag de votre campus dans le message de votre donation.
          </p>

          <div style={styles.exampleBox}>
            <p style={styles.exampleLabel}>Hashtags :</p>
            <div style={styles.hashtagList}>
              <span style={styles.hashtag}>#AixEnProvence</span>
              <span style={styles.hashtag}>#Angouleme</span>
              <span style={styles.hashtag}>#Arras</span>
              <span style={styles.hashtag}>#Bordeaux</span>
              <span style={styles.hashtag}>#Brest</span>
              <span style={styles.hashtag}>#Caen</span>
              <span style={styles.hashtag}>#Chateauroux</span>
              <span style={styles.hashtag}>#Dijon</span>
              <span style={styles.hashtag}>#Grenoble</span>
              <span style={styles.hashtag}>#LaRochelle</span>
              <span style={styles.hashtag}>#LeMans</span>
              <span style={styles.hashtag}>#Lille</span>
              <span style={styles.hashtag}>#Lyon</span>
              <span style={styles.hashtag}>#Montpellier</span>
              <span style={styles.hashtag}>#Nancy</span>
              <span style={styles.hashtag}>#Nantes</span>
              <span style={styles.hashtag}>#Nanterre</span>
              <span style={styles.hashtag}>#Nice</span>
              <span style={styles.hashtag}>#Orleans</span>
              <span style={styles.hashtag}>#Pau</span>
              <span style={styles.hashtag}>#Reims</span>
              <span style={styles.hashtag}>#Rouen</span>
              <span style={styles.hashtag}>#SaintNazaire</span>
              <span style={styles.hashtag}>#Strasbourg</span>
              <span style={styles.hashtag}>#Toulouse</span>
            </div>
          </div>

          <p style={styles.note}>
            Les donations sans hashtag reconnu seront comptabilisées dans le total global
            mais n'apparaîtront pas dans le classement des campus.
          </p>
        </div>
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--orange-primary)',
  } as React.CSSProperties,

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
    flex: 1,
  } as React.CSSProperties,

  description: {
    color: 'var(--white)',
    fontSize: '1rem',
    lineHeight: '1.6',
    opacity: 0.9,
  } as React.CSSProperties,

  eventInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    marginBottom: 'var(--spacing-sm)',
  } as React.CSSProperties,

  infoLine: {
    color: 'var(--white)',
    fontSize: '1rem',
    lineHeight: '1.6',
    opacity: 0.9,
    margin: 0,
  } as React.CSSProperties,

  link: {
    color: 'var(--orange-primary)',
    textDecoration: 'none',
    fontWeight: '600',
  } as React.CSSProperties,

  goal: {
    color: 'var(--white)',
    fontSize: '1rem',
    lineHeight: '1.6',
    opacity: 0.95,
    fontWeight: '600',
    margin: 0,
  } as React.CSSProperties,

  divider: {
    height: '1px',
    backgroundColor: 'var(--grey-light)',
    opacity: 0.3,
  } as React.CSSProperties,

  hashtagSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  hashtagHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  hashtagTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--orange-light)',
  } as React.CSSProperties,

  hashtagText: {
    color: 'var(--white)',
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    opacity: 0.85,
  } as React.CSSProperties,

  exampleBox: {
    backgroundColor: 'var(--grey-light)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
  } as React.CSSProperties,

  exampleLabel: {
    color: 'var(--white)',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: 'var(--spacing-sm)',
    opacity: 0.9,
  } as React.CSSProperties,

  hashtagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  hashtag: {
    backgroundColor: 'var(--black)',
    color: 'var(--orange-pale)',
    padding: '0.375rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid var(--orange-primary)',
  } as React.CSSProperties,

  note: {
    color: 'var(--white)',
    fontSize: '0.8125rem',
    lineHeight: '1.5',
    opacity: 0.6,
    fontStyle: 'italic',
  } as React.CSSProperties,
}
