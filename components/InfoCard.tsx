'use client'

import { Info, Hash } from 'lucide-react'

export default function InfoCard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Info size={24} style={{ color: 'var(--orange-primary)' }} />
        <h2 style={styles.title}>À propos de l'événement</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.description}>
          Bienvenue sur le tracker officiel du <strong>CES'Event 2025</strong> !
          Suivez en temps réel les donations de chaque campus et voyez qui mène la compétition.
        </p>

        <div style={styles.divider} />

        <div style={styles.hashtagSection}>
          <div style={styles.hashtagHeader}>
            <Hash size={20} style={{ color: 'var(--orange-light)' }} />
            <h3 style={styles.hashtagTitle}>Comment ça marche ?</h3>
          </div>

          <p style={styles.hashtagText}>
            Pour que votre donation soit comptabilisée pour votre campus,
            ajoutez simplement le hashtag de votre campus dans le message de votre donation.
          </p>

          <div style={styles.exampleBox}>
            <p style={styles.exampleLabel}>Exemples de hashtags :</p>
            <div style={styles.hashtagList}>
              <span style={styles.hashtag}>#Paris</span>
              <span style={styles.hashtag}>#Lyon</span>
              <span style={styles.hashtag}>#Nanterre</span>
              <span style={styles.hashtag}>#Bordeaux</span>
              <span style={styles.hashtag}>#Marseille</span>
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
