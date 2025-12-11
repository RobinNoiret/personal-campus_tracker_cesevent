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
    padding: 'var(--spacing-xl)',
    backgroundColor: 'var(--black)',
  } as React.CSSProperties,

  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-lg)',
  } as React.CSSProperties,

  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-xl)',
    color: 'var(--primary)',
    textAlign: 'center',
  } as React.CSSProperties,

  section: {
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-sm)',
    color: 'var(--white)',
  } as React.CSSProperties,

  text: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'var(--white)',
  } as React.CSSProperties,

  backLink: {
    display: 'inline-block',
    marginTop: 'var(--spacing-lg)',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    transition: 'color 0.2s',
  } as React.CSSProperties,
}
