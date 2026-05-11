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
