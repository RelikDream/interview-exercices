import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { CartService } from '../../core/cart.service';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      animationsEnabled:false
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
  });

  it('devrait mettre à jour le compteur quand un article est ajouté', () => {
    const localCartService = fixture.debugElement.injector.get(CartService);

    localCartService.addItem({ name: 'Clavier mécanique', price: 129 });
    fixture.detectChanges();

    const toolbar: HTMLElement = fixture.nativeElement;
    expect(toolbar.textContent?.trim()).toContain('Panier (1)');
  });
});
