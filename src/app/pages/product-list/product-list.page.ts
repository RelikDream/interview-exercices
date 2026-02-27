import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {BehaviorSubject, startWith, Subject} from 'rxjs';
import {CartService} from '../../core/cart.service';
import {ProductService} from '../../core/product.service';
import {AsyncPipe, CurrencyPipe, NgForOf} from '@angular/common';
import {Product} from '../../model/product';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';

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
    AsyncPipe,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListPage {
  readonly searchControl = new FormControl('');
  private readonly _filteredProducts = new BehaviorSubject<Product[]>([]);
  readonly filteredProducts =  this.searchControl.valueChanges
  private readonly fb = inject(FormBuilder)
  readonly formControl = this.fb.group({
    product:['',Validators.required],
    price:  [0, [Validators.required,Validators.min(0)]]
  })

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
