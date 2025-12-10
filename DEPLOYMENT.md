# Guide de Déploiement

Ce guide explique comment déployer le CES'Event Campus Tracker sur différentes plateformes.

## Déploiement sur Vercel (Recommandé)

Vercel est la plateforme recommandée car elle est développée par l'équipe Next.js et offre un déploiement gratuit avec certificat SSL.

### Étapes

1. **Créez un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec votre compte GitHub

2. **Importez votre projet**
   - Cliquez sur "New Project"
   - Importez votre repository GitHub
   - Vercel détectera automatiquement Next.js

3. **Configurez les variables d'environnement**
   - Dans les settings du projet, allez dans "Environment Variables"
   - Ajoutez : `STREAMLABS_ACCESS_TOKEN` avec votre token
   - Appliquez à Production, Preview et Development

4. **Déployez**
   - Cliquez sur "Deploy"
   - Le site sera disponible sur `https://votre-projet.vercel.app`

### Déploiement automatique

Chaque push sur la branche `main` déclenchera un déploiement automatique.

## Déploiement sur Netlify

### Étapes

1. **Créez un compte Netlify**
   - Allez sur [netlify.com](https://netlify.com)

2. **Importez votre projet**
   - "Add new site" > "Import an existing project"
   - Connectez votre repository

3. **Configuration Build**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

4. **Variables d'environnement**
   - Site settings > Environment variables
   - Ajoutez `STREAMLABS_ACCESS_TOKEN`

5. **Déployez**

## Déploiement VPS (Ubuntu/Debian)

### Prérequis
- Serveur Ubuntu 20.04+ ou Debian 11+
- Node.js 18+
- Nginx
- Certificat SSL (Let's Encrypt)

### Installation

1. **Installez Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clonez le projet**
```bash
git clone <votre-repo> /var/www/ces-event-tracker
cd /var/www/ces-event-tracker
```

3. **Installez les dépendances**
```bash
npm ci --only=production
```

4. **Configurez les variables d'environnement**
```bash
nano .env.local
```
Ajoutez :
```
STREAMLABS_ACCESS_TOKEN=votre_token
```

5. **Build l'application**
```bash
npm run build
```

6. **Configurez PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start npm --name "ces-event-tracker" -- start
pm2 save
pm2 startup
```

7. **Configurez Nginx**
```bash
sudo nano /etc/nginx/sites-available/ces-event-tracker
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activez :
```bash
sudo ln -s /etc/nginx/sites-available/ces-event-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Installez SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Déploiement avec Docker

### Dockerfile

Créez un fichier `Dockerfile` :

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

Créez un fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - STREAMLABS_ACCESS_TOKEN=${STREAMLABS_ACCESS_TOKEN}
    restart: unless-stopped
```

### Commandes

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## Configuration OBS Studio

Pour intégrer l'overlay dans votre stream :

1. **Ajoutez une source Navigateur**
   - Cliquez droit dans Sources > Ajouter > Navigateur

2. **Configurez la source**
   - URL : `https://votre-domaine.com/overlay`
   - Largeur : 1920
   - Hauteur : 1080
   - FPS : 30
   - Cochez "Actualiser le navigateur quand la scène devient active"

3. **Personnalisez la position**
   - Placez l'overlay où vous voulez dans votre scène
   - Ajustez la taille si nécessaire

4. **Tips**
   - Créez une scène dédiée pour l'overlay
   - Utilisez des transitions pour l'affichage/masquage
   - Testez avec une donation test

## Monitoring et Logs

### Vercel
- Logs disponibles dans le dashboard
- Monitoring automatique
- Alertes par email

### VPS avec PM2
```bash
# Logs en temps réel
pm2 logs ces-event-tracker

# Monitoring
pm2 monit

# Redémarrage
pm2 restart ces-event-tracker

# Status
pm2 status
```

### Docker
```bash
# Logs
docker-compose logs -f app

# Stats
docker stats

# Redémarrage
docker-compose restart
```

## Mise à jour

### Vercel
- Push sur GitHub
- Déploiement automatique

### VPS
```bash
cd /var/www/ces-event-tracker
git pull
npm ci --only=production
npm run build
pm2 restart ces-event-tracker
```

### Docker
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Le site ne charge pas
- Vérifiez que le serveur est démarré : `pm2 status`
- Vérifiez les logs : `pm2 logs`
- Vérifiez nginx : `sudo nginx -t`

### Erreur de token Streamlabs
- Vérifiez que la variable d'environnement est définie
- Vérifiez que le token est valide
- Régénérez le token si nécessaire

### L'overlay ne s'affiche pas dans OBS
- Vérifiez l'URL dans OBS
- Vérifiez que le site est accessible
- Essayez d'ouvrir l'URL dans un navigateur

### Cache problématique
- Le cache est de 30 secondes
- Attendez 30 secondes pour voir les nouvelles données
- En développement, désactivez le cache si nécessaire

## Sécurité en Production

### Checklist
- [ ] HTTPS activé (certificat SSL)
- [ ] Token API en variable d'environnement
- [ ] `.env.local` dans `.gitignore`
- [ ] Headers de sécurité activés (middleware)
- [ ] Rate limiting activé (Cloudflare ou nginx)
- [ ] Monitoring des erreurs activé
- [ ] Backups réguliers

### Rate Limiting avec Nginx
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### Cloudflare
- Activez le proxy DNS
- Configurez les règles de cache
- Activez le rate limiting
- Activez le WAF (Web Application Firewall)

## Support

Pour toute question :
- Consultez les logs
- Vérifiez la configuration
- Ouvrez une issue GitHub
