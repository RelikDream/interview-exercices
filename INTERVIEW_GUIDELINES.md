# Guide de l'Examinateur — Zenika Angular Interview

## Contexte de l'exercice

Le candidat travaille sur un MVP d'une application e-commerce de matériel informatique.
L'application présente deux bugs à corriger en priorité, suivis de fonctionnalités optionnelles si le temps le permet.

**Stack** : Angular 21 (standalone), Angular Material, RxJS, Vitest

**Commandes utiles pour le candidat :**
```bash
npm run test      # lancer les tests (3 en échec au départ)
npm start         # lancer l'application
```

**Objectif de départ** : faire passer les 3 tests en échec au vert.

---

## Bug #1 — Le compteur panier ne se met pas à jour

### Ce que le candidat doit trouver

**Fichier concerné** : `src/app/components/navbar/navbar.component.ts`

Le composant `NavbarComponent` déclare `providers: [CartService]` dans son décorateur `@Component`. Cela crée une **instance locale** du service, isolée du singleton racine utilisé par `ProductListPage`. Quand un produit est ajouté au panier, c'est le `CartService` racine qui est mis à jour — la navbar écoute le sien, qui ne reçoit jamais rien.

Problème secondaire : avec `ChangeDetectionStrategy.OnPush`, affecter `this.count = c` dans un `subscribe()` ne déclenche pas de détection de changements. La vue reste figée même si la valeur change.

```typescript
// navbar.component.ts — code bugué
@Component({
  providers: [CartService],              // ← crée une instance locale, isolée
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  count = 0;

  ngOnInit(): void {
    this.cartService.getCount().subscribe(c => this.count = c); // ← ne rafraîchit pas la vue (OnPush)
  }
}
```

### Solution attendue

**Correction minimale :**
1. Supprimer `providers: [CartService]` pour utiliser le singleton racine.
2. Exposer un `Observable<number>` et le consommer avec le pipe `async` dans le template, ce qui gère automatiquement la détection de changements sous OnPush.

```typescript
// navbar.component.ts — corrigé
@Component({
  // providers: [CartService] supprimé
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly count$ = this.cartService.getCount();

  constructor(private cartService: CartService) {}
}
```

```html
<!-- navbar.component.html -->
Panier ({{ count$ | async }})
```

**Correction alternative acceptable** : garder le `subscribe` et injecter `ChangeDetectorRef` pour appeler `cdr.markForCheck()` après chaque mise à jour. Moins élégant mais correct.

### Comment évaluer

| Niveau | Critères |
|--------|----------|
| **Insuffisant** | Ne trouve pas la cause, modifie le template ou le service sans comprendre le problème DI |
| **Passable** | Identifie l'un des deux problèmes (DI ou OnPush) mais pas les deux |
| **Bon** | Identifie les deux causes, supprime `providers`, utilise `async` pipe ou `markForCheck()` |
| **Excellent** | Explique spontanément pourquoi `providers` dans un composant crée un scope local, et pourquoi OnPush + mutation de propriété ne fonctionne pas sans `markForCheck` ou `async` |

**Questions à poser si le candidat hésite :**
- « Combien d'instances de `CartService` existent dans l'application en ce moment ? »
- « Que fait `providers` au niveau d'un composant versus au niveau `root` ? »
- « Pourquoi `OnPush` peut-il empêcher la mise à jour de la vue ici ? »

**Signal positif** : le candidat consulte les tests en échec pour comprendre le comportement attendu avant de toucher au code.

---

## Bug #2 — La recherche de produits est erratique

### Ce que le candidat doit trouver

**Fichier concerné** : `src/app/pages/product-list/product-list.page.ts`

Le `ProductService.search()` simule un délai réseau aléatoire (0–300 ms). Quand l'utilisateur tape rapidement, plusieurs requêtes sont envoyées en parallèle. La dernière requête à **arriver** (pas à **partir**) écrase les résultats — une réponse obsolète peut donc remplacer les résultats à jour.

```typescript
// product-list.page.ts — code bugué
this.searchControl.valueChanges
  .pipe(takeUntilDestroyed(), startWith(this.searchControl.value))
  .subscribe(term => {
    this.productService.search(term).subscribe(results => { // ← subscribe imbriqué, pas d'annulation
      this._filteredProducts.next(results);
    });
  });
```

**Scénario illustrant le bug** (reproduit par le test) :
- t=10ms : frappe « c » → requête part, réponse attendue dans ~70ms
- t=20ms : frappe « cl » → requête part, réponse attendue dans ~20ms
- t=40ms : résultats « cl » arrivent → affichés
- t=80ms : résultats « c » arrivent → **écrasent** les résultats « cl » ← bug

### Solution attendue

**Étape 1 — correction minimale** : remplacer le `subscribe` imbriqué par `switchMap`.

```typescript
// product-list.page.ts — correction partielle
this.searchControl.valueChanges
  .pipe(
    takeUntilDestroyed(),
    startWith(this.searchControl.value),
    switchMap(term => this.productService.search(term)) // ← annule la requête précédente
  )
  .subscribe(results => {
    this._filteredProducts.next(results);
  });
```

**Étape 2 — refactoring idiomatique** : le `BehaviorSubject` n'a plus de raison d'exister. Il n'était qu'un intermédiaire pour passer d'un `subscribe` impératif à un observable. Avec `switchMap`, la chaîne est entièrement déclarative et `filteredProducts` peut être déclaré directement comme observable de classe.

```typescript
// product-list.page.ts — version idiomatique complète
readonly filteredProducts = this.searchControl.valueChanges.pipe(
  startWith(this.searchControl.value),
  switchMap(term => this.productService.search(term)),
  takeUntilDestroyed()
);

// Les lignes suivantes disparaissent entièrement :
// private readonly _filteredProducts = new BehaviorSubject<Product[]>([]);
// readonly filteredProducts = this._filteredProducts.asObservable();
// Et le bloc subscribe() dans le constructeur aussi
```

Le template continue de fonctionner sans modification car `filteredProducts` reste un `Observable<Product[]>` consommé par `async`.

### Comment évaluer

| Niveau | Critères |
|--------|----------|
| **Insuffisant** | Propose de désactiver le champ pendant la recherche, ou ne comprend pas la nature asynchrone du bug |
| **Passable** | Identifie le problème de race condition mais propose une solution partielle (ex : debounce seul, sans switchMap) |
| **Bon** | Utilise `switchMap`, explique qu'il annule l'observable précédent, fait passer le test |
| **Excellent** | Va plus loin en supprimant le `BehaviorSubject` devenu inutile et en déclarant `filteredProducts` comme observable de propriété de classe directement |

**Questions à poser si le candidat hésite :**
- « Que se passe-t-il si deux requêtes partent en même temps et que la première revient après la seconde ? »
- « Quelles différences y a-t-il entre `mergeMap`, `concatMap` et `switchMap` ? »
- « Pourquoi un `subscribe` imbriqué est-il une mauvaise pratique en RxJS ? »

**Signal positif** : le candidat lit le test `ne devrait pas écraser les résultats récents...` pour comprendre précisément le scénario à corriger avant de coder.

---

## Fonctionnalités optionnelles (si le temps le permet)

Ces fonctionnalités ne sont pas testées automatiquement. L'évaluation est qualitative.

### Feature 1 — Formulaire d'ajout de produit personnalisé

L'énoncé ne précise pas le type de formulaire à utiliser. Le choix est laissé au candidat, mais **la solution attendue est un formulaire réactif** (`ReactiveFormsModule`). Observer si le candidat fait ce choix naturellement est en soi un signal d'évaluation.

**Attendu :**
- Formulaire avec au moins un champ « Nom »
- Bouton « Ajouter au panier » désactivé tant que le nom ne contient aucun caractère visible (`trim().length === 0`)
- Le nom est trimé avant l'ajout (`value.trim()`)

**Points d'attention :**
- Choisit-il un formulaire réactif ou template-driven ? Peut-il justifier son choix ?
- Pour désactiver le bouton, la solution attendue est un **validator** sur le champ — pas une logique ad hoc dans le template ou le composant. `Validators.required` seul ne suffit pas car il laisse passer les chaînes de whitespace ; un validator personnalisé (ou `Validators.pattern(/\S+/)`) est nécessaire.
- Remet-il le formulaire à zéro après l'ajout ?

| Niveau | Critères |
|--------|----------|
| **Insuffisant** | Désactive le bouton avec une condition dans le template (`[disabled]="!name"`) sans passer par la validation du formulaire |
| **Passable** | Utilise `Validators.required` mais ne traite pas le cas du whitespace |
| **Bon** | Utilise un validator qui rejette les chaînes vides ou composées uniquement d'espaces |
| **Excellent** | Crée un validator réutilisable, ou justifie l'usage de `Validators.pattern` vs un validator personnalisé |

**Questions à poser :**
- « Pourquoi avoir choisi ce type de formulaire ? »
- « Que se passe-t-il si l'utilisateur saisit uniquement des espaces ? `Validators.required` suffit-il ? »

### Feature 2 — Page récapitulatif du panier

**Attendu :**
- Route `/cart` avec un nouveau composant
- Liste des articles ajoutés et total calculé
- Navigation depuis la navbar au clic sur le panier

**Points d'attention :**
- Réutilise-t-il le `CartService` existant ou en crée-t-il un nouveau ?
- Le total est-il calculé de façon réactive (avec `map`) ou impérative ?
- Gère-t-il le cas du panier vide ?

### Feature 3 — Page de détail produit

**Attendu :**
- Route `/product/:id` ou équivalent
- Affichage des informations du produit sélectionné

**Points d'attention :**
- Comment transmet-il le produit à la route ? (state de navigation, paramètre d'URL, query param)
- Gère-t-il l'accès direct à l'URL sans contexte de navigation (produit introuvable) ?

---

## Grille d'évaluation globale

| Critère | Poids suggéré |
|---------|--------------|
| Bug #1 — diagnostic de l'injection de dépendance | 25 % |
| Bug #1 — correction OnPush / async pipe | 15 % |
| Bug #2 — compréhension de la race condition | 20 % |
| Bug #2 — utilisation correcte de switchMap | 20 % |
| Qualité du code (lisibilité, idiomes Angular/RxJS) | 10 % |
| Features optionnelles | 10 % |

### Signaux positifs transversaux

- Lit les tests en échec **avant** de modifier le code
- Lance `npm run test` pour vérifier ses corrections
- Explique son raisonnement à voix haute (si entretien)
- Connaît les opérateurs RxJS et sait en justifier le choix
- Ne sur-ingénierie pas (ne réécrit pas ce qui n'est pas cassé)

### Signaux d'alerte
- Modifie le `CartService` ou les tests pour faire passer les tests
- Utilise `setTimeout` ou d'autres hacks pour contourner la race condition
- Ne comprend pas la différence entre `providedIn: 'root'` et `providers: [...]` dans un composant
- Ignore `OnPush` et passe en `Default` sans l'expliquer (solution qui fonctionne mais passe à côté du problème)
