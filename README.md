# Zenika angular interview
## Context
Nous developpons une solution ecommerce de materiel informatique
Aujourd'hui nous avons un mvp qui présente différent bugs:

1. le clique sur ajouter au panier ne met pas a jour le compteur dans la barre de navigation
2. la recherche de produit semble ératique

Nous voulons dans un premier temp corriger ces deux bugs

Ensuite si le temps nous le permet nous aimerions ajouter la fonctionalité suivante
1. En tant que __Client__, j'aimerai pouvoir rajouter via un formulaire __réactif__ un article non présent dans le formulaire. Le bouton d'ajout au panier devra être **desactivé** tant que que le nom du produit ne comportera aucun caractère visible.
2. Lors de l'ajout nous voulons retirer tout les eventuels caractère blancs ajoutés par erreur en debut et fin du nom du produit.
2. En tant que client , lorsque je clique sur le panier je voudrai être redirigé sur une page de resumé du panier affichant le resumé de mon panier ainsi que son coup final
3. je voudrais aussi avoir une page de description du produit au clique sur ce dernier
