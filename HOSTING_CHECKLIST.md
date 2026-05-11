# ✅ Checklist d'hébergement - Maison Eclat Bijoux

## Fichiers créés pour le déploiement Render
- ✅ `auth-routes-postgres.js` - Version PostgreSQL de l'authentification
- ✅ `server.js` - Serveur complet de la boutique, utilise aussi sur Render
- ✅ `DEPLOYMENT_GUIDE.md` - Guide complet de déploiement
- ✅ `render.yaml` - Configuration de déploiement

## 🚀 Démarrage rapide (3 étapes)

### Étape 1: Configuration locale
```bash
# Installer les dépendances (y compris pg pour PostgreSQL)
npm install

# Tester en local (optionnel)
npm start
```

### Étape 2: Initialiser Git et pousser vers GitHub
```bash
# Si pas encore fait
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub: https://github.com/new
# Puis:
git remote add origin https://github.com/VOTRE-USERNAME/maison-eclat.git
git branch -M main
git push -u origin main
```

### Étape 3: Déployer sur Render
1. Aller sur **https://render.com**
2. **Sign up with GitHub**
3. **New** → **PostgreSQL Database**
   - Name: `maison-eclat-db`
   - Database: `maison_eclat`
   - Région: la plus proche de vous
   - **Créer**
   - Copier la **Connection String** (URL de la base)
4. **New** → **Web Service**
   - Connecter votre repo GitHub
   - Name: `maison-eclat-bijoux`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: **Free**
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=votre-clé-secrète-aléatoire-ici
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=votre-email@gmail.com
     SMTP_PASS=votre-mot-de-passe-app
     MAIL_TO=votre-email@gmail.com
     ```
   - **Créer**

## 📱 C'est tout!
Votre site sera en ligne à: `https://votre-app-name.onrender.com`

## 🔐 Configuration SMTP (Gmail)
Pour envoyer des emails via Gmail:
1. Activer la **2FA** sur votre compte Google
2. Créer un **mot de passe d'application**: https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `SMTP_PASS`

## ⚠️ Points importants
- Le tier **Free de Render** s'endort après 15 min d'inactivité (redémarrage automatique à la prochaine visite)
- Les données PostgreSQL sont persistantes (ne sont pas perdues)
- Votre domaine personnalisé peut être configuré dans les paramètres Render
- Visitez https://render.com/docs pour plus d'aide

## 🆘 Troubleshooting
Si le déploiement échoue:
1. Vérifiez les **logs** dans le dashboard Render
2. Vérifiez que `npm install` se termine sans erreur
3. Vérifiez que le Start Command est `node server.js`
4. Assurez-vous que le repo GitHub est public ou bien connecté à Render

Besoin d'aide? Consultez: https://render.com/docs
