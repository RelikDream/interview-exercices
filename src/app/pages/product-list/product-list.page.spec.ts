import {TestBed} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/testing';
import {of} from 'rxjs';
import {ProductListPage} from './product-list.page';
import {ProductService} from '../../core/product.service';
import {CartService} from '../../core/cart.service';
import {Product} from '../../model/product';

describe('ProductListPage', () => {
  let scheduler: TestScheduler;
  let productServiceSpy: { search: ReturnType<typeof vi.fn> };
  let cartServiceSpy: { addItem: ReturnType<typeof vi.fn> };

  const allProducts: Product[] = [
    { name: 'Clavier mécanique', price: 129 },
    { name: 'Souris ergonomique', price: 79 },
    { name: 'Écran 27"', price: 349 },
    { name: 'Câble USB-C', price: 12 },
  ];
  const cResults: Product[] = [
    { name: 'Clavier mécanique', price: 129 },
    { name: 'Câble USB-C', price: 12 },
  ];

  const clResults: Product[] = [{ name: 'Clavier mécanique', price: 129 }];


  beforeEach(async () => {
    productServiceSpy = { search: vi.fn().mockReturnValue(of(allProducts)) };
    cartServiceSpy = { addItem: vi.fn() };
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
      ],
      animationsEnabled: false,
    }).compileComponents();
  });

  it('ne devrait pas écraser les résultats récents avec une réponse obsolète', () => {
    scheduler.run(({ cold, expectObservable }) => {

      productServiceSpy.search.mockImplementation((term: string | null) => {
        if (!term || term === '') return cold('(a|)', { a: allProducts }); // sync
        if (term === 'c')        return cold('70ms (a|)', { a: cResults });
        if (term === 'cl')       return cold('20ms (a|)', { a: clResults });
        return cold('(a|)', { a: [] });
      });

      const fixture = TestBed.createComponent(ProductListPage);
      const component = fixture.componentInstance;
      fixture.detectChanges(); // Déclenche startWith('') → search('') → allProducts émis à t=0

      // Simule une frappe rapide : "c" à t=10ms, "cl" à t=20ms
      scheduler.schedule(() => component.searchControl.setValue('c'),  10);
      scheduler.schedule(() => component.searchControl.setValue('cl'), 20);

      expectObservable(component.filteredProducts, '100ms !').toBe(
        'a 39ms b 59ms ',
        { a: allProducts, b: clResults }
      );
    });
  });

  it('devrait afficher tous les produits au chargement', async () => {
    const fixture = TestBed.createComponent(ProductListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('mat-list-item');
    expect(items).toHaveLength(allProducts.length);
  });

  it('devrait filtrer les produits selon le terme de recherche', async () => {
    const clResults: Product[] = [{ name: 'Clavier mécanique', price: 129 }];
    productServiceSpy.search.mockImplementation((term: string | null) =>
      !term || term.trim() === '' ? of(allProducts) : of(clResults)
    );

    const fixture = TestBed.createComponent(ProductListPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.searchControl.setValue('cl');
    await fixture.whenStable();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('mat-list-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Clavier mécanique');
  });

  it("devrait appeler cartService.addItem avec le bon produit au clic sur le bouton d'ajout", async () => {
    const fixture = TestBed.createComponent(ProductListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const firstButton:HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Ajouter au panier"]'
    );
    expect(firstButton).toBeTruthy();

    firstButton!.click();

    expect(cartServiceSpy.addItem).toHaveBeenCalledWith(allProducts[0]);
  });
});
