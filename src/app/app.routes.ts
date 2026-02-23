import { Routes } from '@angular/router';
import {ProductListPage} from './pages/product-list/product-list.page';

export const routes: Routes = [
  {path: '',
    redirectTo:'products',
    pathMatch:'full',
  },
  {
  path: 'products',
  component:ProductListPage
}];
