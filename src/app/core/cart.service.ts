import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Product} from '../model/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: Product[] = [];
  private readonly cartCount$ = new BehaviorSubject<number>(0);

  addItem(item: Product): void {
    this.items =[...this.items, item]
    this.cartCount$.next(this.items.length);
  }

  getCount(): Observable<number> {
    return this.cartCount$.asObservable();
  }
}
