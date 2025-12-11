# Configuration du Cron Job Vercel

## ✅ Fichiers créés

1. **`app/api/cron/route.ts`** : API route qui gère la synchronisation
2. **`vercel.json`** : Configuration du cron job Vercel

## 🔐 Configuration requise sur Vercel

### Étape 1 : Ajouter la variable d'environnement CRON_SECRET

1. Allez dans votre projet Vercel
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez une nouvelle variable :
   - **Name** : `CRON_SECRET`
   - **Value** : Une chaîne aléatoire sécurisée (par exemple : `votre-secret-super-securise-123`)
   - **Environments** : Sélectionnez **Production**, **Preview**, et **Development**

💡 **Tip** : Générez un secret aléatoire avec cette commande :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 2 : Déployer sur Vercel

```bash
git add .
git commit -m "feat: add Vercel cron job for donation sync"
git push
```

Le cron job sera automatiquement activé après le déploiement !

## 📅 Fréquence de synchronisation

Actuellement configuré pour **toutes les 5 minutes** :
```json
"schedule": "*/5 * * * *"
```

### Modifier la fréquence

Éditez `vercel.json` et changez le `schedule` :

- **Toutes les minutes** : `* * * * *`
- **Toutes les 5 minutes** : `*/5 * * * *`
- **Toutes les 10 minutes** : `*/10 * * * *`
- **Toutes les 30 minutes** : `*/30 * * * *`
- **Toutes les heures** : `0 * * * *`

Format : `minute heure jour mois jour-de-semaine`

## 🧪 Tester le cron job

### Test en local

Vous ne pouvez pas tester le cron Vercel en local, mais vous pouvez tester l'API route :

```bash
# Créez un fichier .env.local avec CRON_SECRET
echo "CRON_SECRET=test-secret" >> .env.local

# Testez l'API
curl -H "Authorization: Bearer test-secret" http://localhost:3000/api/cron
```

### Test en production

Une fois déployé, Vercel appellera automatiquement `/api/cron` selon le schedule.

Vous pouvez voir les logs dans :
- **Vercel Dashboard** → **Deployments** → Sélectionnez votre deployment → **Functions**
- Cliquez sur `/api/cron` pour voir les logs d'exécution

## 📊 Monitoring

### Voir les exécutions du cron

1. Allez dans **Vercel Dashboard**
2. Sélectionnez votre projet
3. Allez dans **Cron Jobs** (dans le menu latéral)
4. Vous verrez toutes les exécutions avec leur statut

### Vérifier que ça fonctionne

Vérifiez que les nouvelles donations apparaissent dans votre base de données après chaque exécution du cron.

## 🚨 Sécurité

⚠️ **Important** : Ne partagez JAMAIS votre `CRON_SECRET` !

L'API route vérifie que toutes les requêtes proviennent bien de Vercel Cron en validant le header `Authorization`.

## 🔄 Migration depuis le script local

Si vous utilisiez `npm run sync` en local, vous n'avez **plus besoin** de le lancer manuellement. Le cron Vercel s'en charge automatiquement en production.

Pour le développement local, vous pouvez toujours utiliser :
```bash
npm run sync
```

## ❓ FAQ

**Q: Le cron fonctionne-t-il en preview/development ?**
R: Par défaut, les crons ne s'exécutent qu'en production. Pour les activer en preview, ajoutez dans `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "*/5 * * * *",
    "environments": ["production", "preview"]
  }]
}
```

**Q: Comment désactiver temporairement le cron ?**
R: Dans le Vercel Dashboard, allez dans **Cron Jobs** et cliquez sur le toggle pour désactiver.

**Q: Combien coûte Vercel Cron ?**
R: C'est inclus dans tous les plans Vercel (gratuit inclus) avec des limites selon votre plan.
