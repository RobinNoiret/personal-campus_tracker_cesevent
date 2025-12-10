# CES'Event Campus Tracker

Outil de suivi en temps réel des donations par campus pour le CES'Event, un événement de stream caritatif organisé par plusieurs campus.

## Fonctionnalités

### 🏆 Classement des Campus
- Affichage en temps réel du classement des campus
- Total des donations par campus
- Nombre de donations par campus
- Statistiques globales de l'événement

### 💝 Flux de Donations
- Liste des dernières donations
- Identification automatique du campus via hashtags
- Rafraîchissement automatique toutes les 10 secondes

### 📺 Overlay OBS
- Vue optimisée pour OBS Studio
- Affichage du top 3 des campus
- Fond semi-transparent pour intégration au stream
- URL : `/overlay`

### 🔒 Sécurité
- Token API jamais exposé côté client
- Routes en lecture seule (GET uniquement)
- Cache de 30 secondes pour éviter le spam de l'API
- Headers de sécurité (CSP, XSS protection, etc.)
- Données en lecture seule (impossible de modifier les stats)

## Installation

### Prérequis
- Node.js 18+
- Un compte Streamlabs avec accès à l'API

### Configuration

1. Clonez le projet
```bash
git clone <votre-repo>
cd ces-event-tracker
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement
```bash
cp .env.local.example .env.local
```

4. Ajoutez votre token Streamlabs dans `.env.local`
```env
STREAMLABS_ACCESS_TOKEN=votre_token_ici
```

Pour obtenir votre token Streamlabs :
1. Connectez-vous sur [https://streamlabs.com](https://streamlabs.com)
2. Allez dans Settings > API Settings
3. Générez un Access Token avec les permissions `donations:read`

5. Configurez vos campus dans `data/campus-aliases.json`
```json
{
  "paris": {
    "name": "Paris",
    "hashtags": ["#paris", "#pariscampus"],
    "aliases": ["paris", "capitale"]
  },
  ...
}
```

## Utilisation

### Développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000)

### Production
```bash
npm run build
npm start
```

### Pages disponibles

- **Dashboard principal** : `http://localhost:3000`
  - Vue complète avec classement et flux de donations

- **Overlay OBS** : `http://localhost:3000/overlay`
  - Top 3 des campus optimisé pour OBS
  - Configuration OBS :
    1. Ajoutez une source "Navigateur"
    2. URL : `http://localhost:3000/overlay`
    3. Largeur : 1920, Hauteur : 1080
    4. Cochez "Arrière-plan transparent" si disponible

### API Routes

#### GET `/api/donations`
Récupère les donations avec parsing du campus

Paramètres :
- `limit` (optionnel) : Nombre de donations (défaut: 100, max: 100)
- `since` (optionnel) : Timestamp pour récupérer les donations après une date

Exemple :
```bash
curl http://localhost:3000/api/donations?limit=10
```

#### GET `/api/leaderboard`
Récupère le classement des campus

Exemple :
```bash
curl http://localhost:3000/api/leaderboard
```

## Format des Donations

Pour qu'une donation soit comptabilisée pour un campus, le donateur doit inclure le hashtag du campus dans son message :

```
"Bonne chance ! #Lyon"
"Go Paris ! #Paris"
"Support depuis Bordeaux #Bordeaux"
```

Les hashtags sont :
- Insensibles à la casse (#lyon = #Lyon = #LYON)
- Insensibles aux accents
- Détectés même au milieu du texte

## Configuration des Campus

Éditez le fichier `data/campus-aliases.json` pour ajouter ou modifier les campus :

```json
{
  "identifiant_unique": {
    "name": "Nom Affiché",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "aliases": ["alias1", "alias2"]
  }
}
```

- **identifiant_unique** : ID unique du campus (lowercase, sans espaces)
- **name** : Nom affiché dans l'interface
- **hashtags** : Liste des hashtags acceptés (avec le #)
- **aliases** : Mots-clés alternatifs dans le message (sans #)

## Architecture

```
ces-event-tracker/
├── app/
│   ├── page.tsx                    # Dashboard principal
│   ├── overlay/page.tsx            # Vue pour OBS
│   ├── api/
│   │   ├── donations/route.ts      # Endpoint donations
│   │   └── leaderboard/route.ts    # Endpoint classement
│   ├── layout.tsx                  # Layout global
│   └── globals.css                 # Styles globaux
├── lib/
│   ├── streamlabs/
│   │   ├── client.ts               # Client API Streamlabs
│   │   └── types.ts                # Types TypeScript
│   ├── campus/
│   │   ├── parser.ts               # Parsing des campus
│   │   ├── config.ts               # Configuration campus
│   │   └── normalizer.ts           # Normalisation texte
│   └── cache.ts                    # Système de cache
├── components/
│   ├── LeaderboardCard.tsx         # Composant classement
│   └── DonationFeed.tsx            # Composant flux donations
├── data/
│   └── campus-aliases.json         # Configuration campus
└── middleware.ts                   # Sécurité
```

## Sécurité

### Protection mise en place
1. **Token API** : Stocké uniquement en variable d'environnement, jamais exposé au client
2. **Routes en lecture seule** : Les API routes n'acceptent que les requêtes GET
3. **Cache** : Limite les appels à l'API Streamlabs (30 secondes)
4. **Headers de sécurité** : CSP, X-Frame-Options, XSS Protection
5. **Validation** : Les données sont validées côté serveur
6. **Pas de modification** : Impossible de modifier les données via l'interface

### Recommandations
- Ne commitez JAMAIS le fichier `.env.local`
- Utilisez un token avec les permissions minimales (`donations:read`)
- En production, utilisez HTTPS
- Configurez un reverse proxy (nginx, Cloudflare) pour le rate limiting

## Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel
```
N'oubliez pas d'ajouter la variable d'environnement `STREAMLABS_ACCESS_TOKEN` dans les settings Vercel.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Développement

### Ajouter un nouveau campus
1. Éditez `data/campus-aliases.json`
2. Redémarrez le serveur
3. Les donations futures seront automatiquement détectées

### Modifier le design
- Couleurs : `app/globals.css` (variables CSS)
- Composants : `components/*.tsx`
- Layout : `app/layout.tsx` et `app/page.tsx`

### Tester le parsing
```typescript
import { parseCampusFromMessage } from '@/lib/campus/parser'

const result = parseCampusFromMessage("Go Lyon ! #Lyon")
console.log(result)
// { campusId: 'lyon', campusName: 'Lyon', confidence: 'high', matchedOn: 'hashtag' }
```

## Troubleshooting

### "STREAMLABS_ACCESS_TOKEN is required"
- Vérifiez que le fichier `.env.local` existe
- Vérifiez que la variable est correctement définie
- Redémarrez le serveur après modification

### Les donations ne sont pas identifiées
- Vérifiez que le hashtag est dans `data/campus-aliases.json`
- Vérifiez la casse et les accents
- Testez avec le composant de debug (voir développement)

### L'overlay ne s'affiche pas dans OBS
- Vérifiez l'URL (doit être `/overlay`)
- Activez les logs navigateur dans OBS
- Vérifiez que le serveur est accessible

## Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs (`npm run dev`)
3. Ouvrez une issue sur GitHub

## Licence

ISC

## Crédits

Développé pour le CES'Event 2025
