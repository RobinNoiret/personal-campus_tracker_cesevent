import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Mentions Légales</h1>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Éditeur du site</h2>
          <p style={styles.text}>
            Robin Noiret <br />
            co-organisateur du CES&apos;Event<br />
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Hébergement</h2>
          <p style={styles.text}>
            Ce site est hébergé par Vercel Inc.<br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789<br />
            États-Unis
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Propriété intellectuelle</h2>
          <p style={styles.text}>
            L&apos;ensemble du contenu de ce site (textes, images, logos) est protégé par les droits d&apos;auteur.
            Toute reproduction ou utilisation non autorisée est interdite.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Données personnelles</h2>
          <p style={styles.text}>
            Ce site ne collecte aucune donnée personnelle des visiteurs.
            Les données de donations affichées sont anonymisées et agrégées par campus.
          </p>
        </section>

        <Link href="/" style={styles.backLink}>
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    padding: 'clamp(1rem, 5vw, 2rem)',
    backgroundColor: 'var(--black)',
  } as React.CSSProperties,

  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(1rem, 5vw, 2rem)',
    boxShadow: 'var(--shadow-lg)',
  } as React.CSSProperties,

  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-xl)',
    color: 'var(--orange-primary)',
    textAlign: 'center',
  } as React.CSSProperties,

  section: {
    marginBottom: 'clamp(1rem, 4vw, 2rem)',
  } as React.CSSProperties,

  subtitle: {
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-sm)',
    color: 'var(--white)',
  } as React.CSSProperties,

  text: {
    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
    lineHeight: '1.6',
    color: 'var(--white)',
  } as React.CSSProperties,

  backLink: {
    display: 'inline-block',
    marginTop: 'var(--spacing-lg)',
    color: 'var(--orange-primary)',
    textDecoration: 'none',
    fontSize: 'clamp(1rem, 3vw, 1.1rem)',
    transition: 'color 0.2s',
  } as React.CSSProperties,
}
