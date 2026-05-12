# Maison Chainee

Boutique e-commerce simple pour vendre des bijoux et accessoires: chaines, montres, bracelets, bagues et pendentifs.

## Langages et technologies

- **HTML**: structure des pages
- **CSS**: design responsive et mise en page
- **JavaScript**: panier, filtres, interactions
- **Node.js + Express**: serveur web et API produits
- **SQLite**: base de donnees locale pour le catalogue

Ce choix reste facile a comprendre: les fichiers importants sont peu nombreux et le site peut tourner sur un ordinateur sans configuration compliquee.

## Lancer le site

```bash
npm start
```

Puis ouvrir:

```text
http://localhost:3006
```

## Configurer les emails

Le formulaire de contact et le bouton de commande peuvent envoyer un email au proprietaire de la boutique.

1. Copier `.env.example` en `.env`
2. Remplir les valeurs SMTP
3. Mettre votre adresse dans `MAIL_TO`
4. Redemarrer le serveur avec `npm start`

Exemple avec Gmail: utilisez un mot de passe d'application, pas le mot de passe normal du compte.

Configuration Gmail typique:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-adresse@gmail.com
SMTP_PASS=votre-mot-de-passe-application
MAIL_FROM="Maison Eclat Bijoux <votre-adresse@gmail.com>"
MAIL_TO=votre-adresse@gmail.com
```

Pour tester sans passer par le formulaire:

```bash
npm run test:email
```

Si Gmail refuse la connexion, activez la validation en deux etapes sur le compte Google, puis creez un mot de passe d'application pour `SMTP_PASS`.

Alternative si Gmail bloque encore: utilisez Brevo avec les identifiants SMTP.

Configuration Brevo typique:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-login-smtp-brevo
SMTP_PASS=votre-cle-smtp-brevo
MAIL_FROM="Maison Eclat Bijoux <votre-adresse-verifiee@domaine.com>"
MAIL_TO=oiandreakouame@gmail.com
```

Dans Brevo, il faut verifier l'adresse utilisee dans `MAIL_FROM`, puis copier le login SMTP et la cle SMTP dans `.env`.

## Fonctionnalites

- Catalogue de bijoux et montres avec images
- Fiche detail quand on clique sur un produit
- Prix affiches en FCFA pour la Cote d'Ivoire
- Interface type marketplace avec barre de recherche
- Filtre par categorie dans le menu et dans la recherche
- Filtrage par categorie
- Panier avec quantites, total et suppression
- Tableau de bord admin des commandes avec produits commandes et coordonnees client
- Formulaire de contact avec envoi email
- Envoi email quand une commande est validee
- Design adapte au telephone et a l'ordinateur

## Tableau de bord admin

Les commandes validees depuis le panier sont stockees dans SQLite avec les produits commandes, le total et les coordonnees du client.

Ouvrir:

```text
http://localhost:3006/admin/orders
```

Si le port 3006 est deja occupe, le serveur essaie automatiquement le port suivant, par exemple `http://localhost:3007/admin/orders`.

## Fichiers principaux

```text
server.js           Serveur Express et produits de depart
public/index.html   Structure de la boutique
public/style.css    Design du site
public/script.js    Panier, filtres et interactions
ecommerce.db        Base SQLite creee automatiquement
```

## Modifier les produits

Les produits de depart sont dans `server.js`, dans la liste `chainProducts`. Tu peux changer les noms, descriptions, prix en FCFA, images, categories et stocks.
