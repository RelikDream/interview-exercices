import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CartService} from '../../core/cart.service';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [
    MatToolbar
  ],
  providers: [CartService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  count = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCount().subscribe(c => this.count = c);
  }
}
