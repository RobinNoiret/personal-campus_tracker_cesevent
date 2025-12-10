# Guide de Personnalisation

Ce guide explique comment personnaliser le CES'Event Campus Tracker pour votre événement.

## Personnalisation des Campus

### Ajouter vos 26 campus

Éditez le fichier [data/campus-aliases.json](data/campus-aliases.json) :

```json
{
  "paris": {
    "name": "Paris",
    "hashtags": ["#paris", "#pariscampus", "#cestparis"],
    "aliases": ["paris", "capitale"]
  },
  "lyon": {
    "name": "Lyon",
    "hashtags": ["#lyon", "#lyoncampus"],
    "aliases": ["lyon"]
  },
  "nanterre": {
    "name": "Nanterre",
    "hashtags": ["#nanterre", "#nanterrecampus"],
    "aliases": ["nanterre"]
  },
  "bordeaux": {
    "name": "Bordeaux",
    "hashtags": ["#bordeaux", "#bordeauxcampus"],
    "aliases": ["bordeaux"]
  },
  "lille": {
    "name": "Lille",
    "hashtags": ["#lille", "#lillecampus"],
    "aliases": ["lille"]
  },
  "toulouse": {
    "name": "Toulouse",
    "hashtags": ["#toulouse", "#toulousecampus"],
    "aliases": ["toulouse"]
  },
  "marseille": {
    "name": "Marseille",
    "hashtags": ["#marseille", "#marseillecampus"],
    "aliases": ["marseille"]
  },
  "strasbourg": {
    "name": "Strasbourg",
    "hashtags": ["#strasbourg", "#strasbourgcampus"],
    "aliases": ["strasbourg"]
  },
  "rennes": {
    "name": "Rennes",
    "hashtags": ["#rennes", "#rennescampus"],
    "aliases": ["rennes"]
  },
  "nantes": {
    "name": "Nantes",
    "hashtags": ["#nantes", "#nantescampus"],
    "aliases": ["nantes"]
  }
}
```

**Note :** Ajoutez les 16 campus restants selon le même modèle.

### Conseils pour les hashtags

1. **Simple et mémorisable** : `#Paris` plutôt que `#CampusParisCES`
2. **Évitez les ambiguïtés** : Si vous avez "Paris Nord" et "Paris Sud", utilisez `#ParisNord` et `#ParisSud`
3. **Variantes** : Ajoutez plusieurs hashtags pour augmenter les chances de détection
4. **Testez** : Utilisez le script de test pour vérifier

```bash
npx tsx scripts/test-parsing.ts "Go Paris ! #Paris"
```

## Personnalisation des Couleurs

### Modifier le thème

Éditez [app/globals.css](app/globals.css) :

```css
:root {
  /* Vos couleurs personnalisées */
  --white: #ffffff;
  --orange-primary: #d3614e;     /* Couleur principale */
  --orange-light: #e87d68;        /* Couleur claire */
  --orange-dark: #bf4d3a;         /* Couleur foncée */
  --orange-pale: #f4a99a;         /* Couleur pale */
  --black: #1e1e1e;               /* Fond principal */
  --grey-dark: #2a2a2a;           /* Fond cartes */
  --grey-light: #3a3a3a;          /* Fond items */
}
```

### Thèmes prédéfinis

#### Thème Bleu
```css
:root {
  --orange-primary: #3b82f6;
  --orange-light: #60a5fa;
  --orange-dark: #2563eb;
  --orange-pale: #93c5fd;
}
```

#### Thème Vert
```css
:root {
  --orange-primary: #10b981;
  --orange-light: #34d399;
  --orange-dark: #059669;
  --orange-pale: #6ee7b7;
}
```

#### Thème Rouge
```css
:root {
  --orange-primary: #ef4444;
  --orange-light: #f87171;
  --orange-dark: #dc2626;
  --orange-pale: #fca5a5;
}
```

## Personnalisation du Texte

### Titre et sous-titre

Éditez [app/page.tsx](app/page.tsx) :

```tsx
<header style={styles.header}>
  <h1 style={styles.mainTitle}>CES'Event 2025</h1>
  <p style={styles.subtitle}>
    Suivez en temps réel les donations par campus
  </p>
</header>
```

### Messages d'incitation

Modifiez le footer dans [app/page.tsx](app/page.tsx) :

```tsx
<footer style={styles.footer}>
  <p style={styles.footerText}>
    💡 Votre message personnalisé ici
  </p>
  <p style={styles.footerSubtext}>
    Exemples de hashtags
  </p>
</footer>
```

## Personnalisation de l'Overlay OBS

### Modifier la mise en page

Éditez [app/overlay/page.tsx](app/overlay/page.tsx) :

```tsx
// Changer le nombre de campus affichés
const top = result.data.leaderboard
  .filter((c: CampusData) => c.donationCount > 0)
  .slice(0, 5) // Affiche le top 5 au lieu du top 3
```

### Modifier les styles

```tsx
const styles = {
  title: {
    fontSize: '3rem',           // Taille du titre
    fontWeight: 'bold',
    color: '#d3614e',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
  } as React.CSSProperties,

  podiumItem: {
    padding: '1.5rem',          // Espacement
    backgroundColor: 'rgba(42, 42, 42, 0.95)', // Fond
    borderRadius: '1rem',       // Arrondi
    border: '2px solid #d3614e', // Bordure
  } as React.CSSProperties,
}
```

### Position dans OBS

Selon votre layout de stream :

**Overlay en bas :**
```css
.container {
  justify-content: flex-end;
  padding-bottom: 100px;
}
```

**Overlay sur le côté :**
```css
.container {
  align-items: flex-end;
  padding-right: 100px;
}
```

## Personnalisation des Composants

### Modifier le classement

Éditez [components/LeaderboardCard.tsx](components/LeaderboardCard.tsx) :

```tsx
// Afficher plus ou moins de campus
const activeCampus = data.leaderboard
  .filter(c => c.donationCount > 0)
  .slice(0, 10) // Top 10 au lieu de tous

// Changer les médailles
<div style={styles.rankBadge}>
  {index === 0 && '👑'}  // Couronne pour le premier
  {index === 1 && '⭐'}
  {index === 2 && '🎖️'}
  {index > 2 && `#${index + 1}`}
</div>

// Afficher un pourcentage
const percentage = (campus.totalAmount / data.stats.totalAmount * 100).toFixed(1)
<div style={styles.campusPercentage}>
  {percentage}%
</div>
```

### Modifier le flux de donations

Éditez [components/DonationFeed.tsx](components/DonationFeed.tsx) :

```tsx
// Changer le nombre de donations affichées
const response = await fetch('/api/donations?limit=20') // 20 au lieu de 10

// Changer le temps de rafraîchissement
const interval = setInterval(fetchDonations, 5000) // 5 secondes au lieu de 10

// Ajouter des effets sonores (nécessite une bibliothèque audio)
useEffect(() => {
  if (donations.length > 0) {
    // Jouer un son pour les nouvelles donations
    playSound()
  }
}, [donations])
```

## Ajout de Fonctionnalités

### Ajouter un graphique d'évolution

Installez une bibliothèque de graphiques :

```bash
npm install recharts
```

Créez un nouveau composant [components/ChartComponent.tsx](components/ChartComponent.tsx) :

```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useEffect, useState } from 'react'

export default function ChartComponent() {
  const [data, setData] = useState([])

  useEffect(() => {
    // Récupérer les données historiques
    // Implémenter la logique ici
  }, [])

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="amount" stroke="#d3614e" />
    </LineChart>
  )
}
```

### Ajouter une barre de progression globale

Créez [components/GoalProgress.tsx](components/GoalProgress.tsx) :

```tsx
'use client'

interface Props {
  current: number
  goal: number
}

export default function GoalProgress({ current, goal }: Props) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>Objectif : {goal}€</span>
        <span>{current.toFixed(2)}€ ({percentage.toFixed(1)}%)</span>
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--grey-dark)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    color: 'var(--white)',
  } as React.CSSProperties,

  progressBar: {
    width: '100%',
    height: '30px',
    backgroundColor: 'var(--grey-light)',
    borderRadius: '15px',
    overflow: 'hidden',
  } as React.CSSProperties,

  progressFill: {
    height: '100%',
    backgroundColor: 'var(--orange-primary)',
    transition: 'width 0.5s ease',
  } as React.CSSProperties,
}
```

### Ajouter des notifications

Installez une bibliothèque de notifications :

```bash
npm install react-hot-toast
```

Utilisez-la dans [app/layout.tsx](app/layout.tsx) :

```tsx
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
```

Dans vos composants :

```tsx
import toast from 'react-hot-toast'

// Nouvelle donation
toast.success(`Nouvelle donation de ${amount}€ pour ${campus}!`)
```

## Configuration Avancée

### Changer la durée du cache

Éditez [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) :

```tsx
const leaderboard = await withCache(
  'leaderboard:stats',
  60 * 1000, // 60 secondes au lieu de 30
  async () => { /* ... */ }
)
```

### Changer le nombre de donations récupérées

Éditez [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) :

```tsx
const rawDonations = await client.getDonations(5000) // 5000 au lieu de 1000
```

### Ajouter des logs de debug

Dans n'importe quel fichier :

```tsx
console.log('[DEBUG] Donation parsed:', {
  message: donation.message,
  campus: result.campusId,
  confidence: result.confidence
})
```

## Testing

### Tester avec des données de mock

Créez [lib/streamlabs/mock-client.ts](lib/streamlabs/mock-client.ts) :

```tsx
import type { NormalizedDonation } from './types'

export class MockStreamlabsClient {
  async getDonations(): Promise<NormalizedDonation[]> {
    return [
      {
        id: '1',
        name: 'Jean Dupont',
        message: 'Go Paris ! #Paris',
        amount: 50,
        currency: 'EUR',
        timestamp: Date.now() / 1000,
        verified: true
      },
      {
        id: '2',
        name: 'Marie Martin',
        message: 'Allez Lyon ! #Lyon',
        amount: 75,
        currency: 'EUR',
        timestamp: Date.now() / 1000,
        verified: true
      }
    ]
  }
}
```

Utilisez-le en développement :

```tsx
const client = process.env.NODE_ENV === 'development'
  ? new MockStreamlabsClient()
  : getStreamlabsClient()
```

## Questions Fréquentes

**Q : Comment changer la devise ?**
R : Modifiez le paramètre `currency` dans [lib/streamlabs/client.ts](lib/streamlabs/client.ts)

**Q : Peut-on avoir plusieurs hashtags par campus ?**
R : Oui ! Ajoutez-les dans le tableau `hashtags` dans [data/campus-aliases.json](data/campus-aliases.json)

**Q : Comment désactiver le cache en développement ?**
R : Mettez le TTL à 0 dans les appels à `withCache()`

**Q : Peut-on exporter les données ?**
R : Oui, créez une nouvelle API route qui retourne les données en CSV ou JSON

## Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Streamlabs API Documentation](https://dev.streamlabs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
