import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {Product} from '../model/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private catalog:Product[] = [
    { name: 'Clavier mécanique', price: 129 },
    { name: 'Souris ergonomique', price: 79 },
    { name: 'Écran 27"', price: 349 },
    { name: 'Câble USB-C', price: 12 },
  ];

  search(term: string | null): Observable<Product[]> {
    let results:Product[] ;
    if(term == null || term.trim().length ===0) {
      results = [...this.catalog];
    }
    else {
      results = this.catalog.filter(p =>
        p.name.toLowerCase().includes((term ?? '').toLowerCase())
      );
    }
    console.info("Appel: GET /v1/products Response:", results)
    return of(results).pipe(delay(Math.random() * 300));
  }
}
