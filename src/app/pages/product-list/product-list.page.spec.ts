import {TestBed} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/testing';
import {ProductListPage} from './product-list.page';
import {ProductService} from '../../core/product.service';
import {CartService} from '../../core/cart.service';
import {Product} from '../../model/product';

/**
 * Marble testing de la recherche dans ProductListPage.
 *
 * Le marble testing permet de contrôler le temps de façon virtuelle via le
 * TestScheduler de RxJS : pas d'attente réelle, timeline précise au ms près.
 */
describe('ProductListPage', () => {
  let scheduler: TestScheduler;
  let productServiceSpy: { search: ReturnType<typeof vi.fn> };

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
    productServiceSpy = { search: vi.fn() };

    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: { addItem: vi.fn() } },
      ],
      animationsEnabled:false
    }).compileComponents();
  });

  it('ne devrait pas écraser les résultats récents avec une réponse obsolète', () => {
    scheduler.run(({ cold, expectObservable }) => {

      // On contrôle précisément le délai de réponse de chaque requête
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
});
