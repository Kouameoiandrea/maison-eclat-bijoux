# Guide d'intégration de l'authentification

## Étapes pour intégrer l'authentification au serveur

### 1. Installer les dépendances
```bash
npm install jsonwebtoken
```

### 2. Mettre à jour package.json
Vérifiez que les dépendances suivantes sont installées:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "sqlite3": "^5.1.6",
    "nodemailer": "^8.0.7",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### 3. Intégrer l'authentification dans server.js

Ajoutez ceci en haut du fichier server.js (après les imports):
```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { initUsersTable, setupAuthRoutes } = require('./auth-routes.js');
```

Après l'initialisation de la base de données `const db = new sqlite3.Database('./ecommerce.db');`, ajoutez:
```javascript
// Initialize authentication
initUsersTable(db);
```

Avant `app.get('/api/categories', ...)`, ajoutez:
```javascript
// Setup authentication routes
setupAuthRoutes(app, db);
```

### 4. Ajouter variables d'environnement (optionnel)
Créez ou mettez à jour le fichier `.env`:
```
JWT_SECRET=your-very-secret-key-change-in-production
```

## Endpoints d'authentification

### POST /api/auth/register
Créer un nouveau compte utilisateur

**Request:**
```json
{
  "fullname": "Nom Complet",
  "email": "user@example.com",
  "phone": "+225XXXXXXXXX",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "fullname": "Nom Complet",
    "email": "user@example.com",
    "phone": "+225XXXXXXXXX"
  }
}
```

### POST /api/auth/login
Se connecter avec email et mot de passe

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "fullname": "Nom Complet",
    "email": "user@example.com",
    "phone": "+225XXXXXXXXX"
  }
}
```

### GET /api/auth/verify
Vérifier la validité d'un token

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "Nom Complet"
  }
}
```

## Fonctionnalités implémentées

1. ✅ **Multi-langues** - Support pour 6 langues (FR, EN, AR, ES, DE, PT)
2. ✅ **Panier amélioré** - Meilleure visibilité et accessibilité
3. ✅ **Authentification client** - Système de connexion/inscription avec tokens JWT
4. ✅ **Formulaires de connexion** - Modal avec onglets Connexion/Inscription
5. ✅ **Base de données** - Table utilisateurs SQLite pour stocker les comptes

## Prochaines améliorations possibles

- Ajouter la récupération de mot de passe
- Ajouter la confirmation d'email
- Implémenter un système d'adresse de livraison pour les utilisateurs connectés
- Ajouter l'historique des commandes utilisateur
- Implémenter les préférences utilisateur (langue, etc.)
- Ajouter la gestion des profils utilisateur
