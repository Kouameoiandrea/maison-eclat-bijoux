# Guide de déploiement sur Render.com

## 📋 Prérequis
- Compte GitHub (gratuit)
- Compte Render.com (gratuit)
- Git installé sur votre ordinateur

## 🚀 Étapes de déploiement

### Étape 1: Créer un compte GitHub
1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur "Sign up"
3. Créez votre compte

### Étape 2: Initialiser et pousser votre code
```bash
# Naviguez dans le dossier du projet
cd "c:\Users\Utilisateur\OneDrive\Bureau\DOSSIER ESATIC MASTER 1 MDSI\PROJET E-COMMERCE"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer un premier commit
git commit -m "Initial commit - Maison Eclat Bijoux"

# Ajouter l'adresse du repo GitHub
git remote add origin https://github.com/VOTRE-USERNAME/maison-eclat.git

# Pousser le code
git branch -M main
git push -u origin main
```

### Étape 3: Créer un compte Render
1. Allez sur [Render.com](https://render.com)
2. Cliquez sur "Sign up with GitHub"
3. Autorisez Render à accéder à votre GitHub

### Étape 4: Créer une base de données PostgreSQL sur Render
1. Dans le dashboard Render, cliquez sur "New +"
2. Sélectionnez "PostgreSQL"
3. Remplissez les informations:
   - Name: `maison-eclat-db`
   - Database: `maison_eclat`
   - User: `postgres`
   - Region: choisir la plus proche
4. Cliquez sur "Create Database"
5. Notez la **connection string** (vous en aurez besoin)

### Étape 5: Créer le Web Service
1. Cliquez sur "New +"
2. Sélectionnez "Web Service"
3. Connectez votre repository GitHub
4. Remplissez les informations:
   - Name: `maison-eclat-bijoux`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free (gratuit)
5. Ajoutez les variables d'environnement:
   ```
   NODE_ENV=production
   PORT=3000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=votre-mot-de-passe-app
   JWT_SECRET=votre-clé-secrète-changerezzzz
   ```
6. Cliquez sur "Create Web Service"

### Étape 6: Monitoring
1. Le déploiement commence automatiquement
2. Consultez les logs pour voir la progression
3. Une fois déployé, vous aurez une URL comme `https://maison-eclat-bijoux.onrender.com`

## 🔧 Variables d'environnement importantes

- **JWT_SECRET**: Clé secrète pour les tokens (changez-la!)
- **SMTP_***: Paramètres pour envoyer des emails
- **NODE_ENV**: Doit être "production"

## ⚠️ Important sur la base de donnees

Le site utilise SQLite avec `server.js`. C'est le plus simple pour mettre la boutique en ligne rapidement sur Render.
Sur l'offre gratuite, les donnees creees apres le deploiement peuvent ne pas etre permanentes si le service est reconstruit. Pour une vraie boutique en production, il faudra ensuite migrer les commandes et comptes clients vers PostgreSQL.

## 📝 Notes
- Le tier gratuit de Render peut se mettre en veille après 15 minutes d'inactivité
- Les bases de données PostgreSQL gratuit peuvent être réinitialisées
- Consultez la documentation Render pour plus de détails: https://render.com/docs
