# Zenika — Entretien technique Angular

## Contexte

Vous intégrez l'équipe qui développe une solution e-commerce de matériel informatique.
Un MVP est déjà en place : les utilisateurs peuvent parcourir un catalogue de produits, les rechercher et les ajouter à leur panier.

Malheureusement, deux bugs ont été remontés en production. Votre mission est de les corriger, puis d'implémenter de nouvelles fonctionnalités si le temps vous le permet.

## Démarrage

```bash
npm install
npm start        # http://localhost:4200
npm run test     # lancer la suite de tests
```

Les tests sont votre principal indicateur de progression : **3 tests sont en échec au départ**, ils doivent tous passer au vert.

---

## Partie 1 — Correction de bugs (prioritaire)

### Bug 1 — Le compteur panier ne se met pas à jour

Quand l'utilisateur clique sur « Ajouter au panier », le compteur affiché dans la barre de navigation reste à zéro.

**Comportement attendu** : le compteur doit refléter en temps réel le nombre d'articles ajoutés au panier.

### Bug 2 — La recherche de produits est erratique

Les résultats affichés lors d'une frappe rapide sont parfois incorrects : des produits inattendus apparaissent ou des résultats semblent appartenir à une recherche précédente.

**Comportement attendu** : les résultats affichés doivent toujours correspondre au terme de recherche le plus récent saisi par l'utilisateur.

---

## Partie 2 — Nouvelles fonctionnalités (si le temps le permet)

Les fonctionnalités suivantes sont exprimées sous forme de user stories, dans l'ordre de priorité.

### 1. Ajout d'un produit personnalisé

> En tant que client, je veux pouvoir ajouter au panier un article qui n'est pas dans le catalogue, en saisissant son nom via un formulaire.

- Le bouton d'ajout doit être **désactivé** tant que le nom ne contient aucun caractère visible

### 2. Page récapitulatif du panier

> En tant que client, je veux pouvoir consulter le contenu de mon panier en cliquant sur l'icône panier dans la barre de navigation.

- La page doit lister les articles ajoutés
- Elle doit afficher le coût total du panier

### 3. Page de détail produit

> En tant que client, je veux accéder à la page de détail d'un produit en cliquant dessus dans la liste.

---

## Stack technique

| Outil | Version |
|-------|---------|
| Angular | 21 |
| Angular Material | — |
| RxJS | — |
| Vitest | — |
