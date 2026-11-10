# CAFFEMENT! Coffee Shop — Menu Digital (Version QR Code)

> Application web mobile-first du menu digital de **Caffement ! Coffee Shop** (*Des moments autrement*), conçue pour être scannée via QR Code sur les tables.

---

## ☕ Présentation du Projet

- **Architecture :** React 19 + Vite 7 (Single Page Application statique ultra-rapide).
- **Design System :** Obsidian Black (`#181916`) & Champagne Gold (`#c9ad7d`), typographie soignée (*Cormorant Garamond* et *DM Sans*).
- **Catalogue complet :** 189 articles répartis en 25 catégories culinaires et 4 grands univers (*Cafés, Chocolat & Thés*, *Boissons Fraîches & Shakes*, *Crêpes, Gaufres & Douceurs*, *Brunch & Salé*).
- **Fonctionnalités clés :**
  - Écran de chargement avec logo doré et animation de lueur pulsante (*Glowing Logo Loader*).
  - Barre de navigation horizontale fluide (*Sticky Category Rail*) avec centrage automatique de la catégorie active.
  - Tiroir mobile complet (*« Toute la carte »*) avec recherche instantanée insensible aux accents.
  - Gestion fine de la tarification double : Sur Place (**SP**) et À Emporter (**EMP**) sur les cafés classiques et thés.
  - Respect strict des règles de tri tarifaire et de l'ordonnancement officiel.

---

## 🚀 Lancement & Développement

### Prérequis
- [Node.js](https://nodejs.org/) (v20+ ou v22+)

### Installation
```bash
npm install
```

### Serveur de développement local & réseau Wi-Fi
```bash
npm run dev
```
Accessible sur votre machine locale via `http://localhost:5173/` et sur vos smartphones connectés au même réseau Wi-Fi.

### Build de production
```bash
npm run build
```
Les fichiers statiques prêts pour le déploiement (Vercel, Netlify, GitHub Pages, etc.) sont générés dans le dossier `dist/`.

---

## 📁 Structure des Fichiers

```text
├── public/
│   ├── favicon.svg              # Favicon officiel CAFFEMENT!
│   └── images/                  # Photographies et logo officiel
├── src/
│   ├── App.jsx                  # Composant principal, navigation, tiroir de recherche
│   ├── main.jsx                 # Point d'entrée React
│   ├── menu.js                  # Base de données officielle (189 articles & tarifs)
│   └── styles.css               # Feuilles de style, variables, animations, responsive
├── index.html                   # Document HTML racine avec métadonnées
├── package.json                 # Dépendances et scripts Vite
└── vite.config.js               # Configuration Vite
```

---

## 📍 Contact & Réseaux
- **Instagram :** [@caffement.coffee.shop](https://www.instagram.com/caffement.coffee.shop)
- **Téléphone :** 29 538 390
