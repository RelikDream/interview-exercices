import {Component, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {BehaviorSubject, startWith, Subject} from 'rxjs';
import {CartService} from '../../core/cart.service';
import {ProductService} from '../../core/product.service';
import {AsyncPipe, CurrencyPipe, NgForOf} from '@angular/common';
import {Product} from '../../model/product';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatList,
    MatListItem,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListPage {
  readonly searchControl = new FormControl('');
  private readonly _filteredProducts = new BehaviorSubject<Product[]>([]);
  readonly filteredProducts = this._filteredProducts.asObservable();

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(),
        startWith(this.searchControl.value))
      .subscribe(term => {
        this.productService.search(term).subscribe(results => {
          this._filteredProducts.next(results);
        });
      });
  }

  addToCart(product: { name: string; price: number }): void {
    this.cartService.addItem(product);
  }

}
