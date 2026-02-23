import {ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import {
By
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import {NavbarComponent} from './components/navbar/navbar.component';
import { RouterTestingHarness } from "@angular/router/testing";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatListHarness } from "@angular/material/list/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe('App', () => {
  let fixture:ComponentFixture<App>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
      ],
      animationsEnabled: false,
    }).compileComponents();
    fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    vitest.useFakeTimers();

  });

  it('devrait mettre à jour le compteur de la navbar après un clic sur "Ajouter au panier"', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/products');

    loader = TestbedHarnessEnvironment.loader(harness.fixture);

    await vitest.runAllTimersAsync();

    const list = await loader.getHarness(MatListHarness);
    const products = await list.getItems();
    const firstProduct = products[0];
    const addToCart = await firstProduct.getHarness(MatButtonHarness);
    expect(addToCart, 'Le bouton "Ajouter au panier" doit être présent dans la page').toBeTruthy();
    addToCart.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = fixture.debugElement.query(By.directive(NavbarComponent));
    expect(toolbar?.nativeElement.textContent?.trim()).toContain('Panier (1)');
  });
});
