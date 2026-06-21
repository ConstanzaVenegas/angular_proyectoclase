import { Routes } from '@angular/router';
import { ProductComponent } from './features/products/components/product/product';
import { Welcome } from './features/home/welcome/welcome';
import { PageNotFound } from './features/not-found/page-not-found/page-not-found';
import { Login } from './features/auth/components/login/login';
import { loginGuard } from './features/auth/guards/login-guard';
import { NumberComponent } from './features/numbers/components/number/number';
import { UserComponent } from './features/users/components/user/user';
import { ProductPagination } from './features/products/components/product-pagination/product-pagination';
import { MapComponent } from './features/maps/components/map/map';

export const routes: Routes = [
  { path: 'home',                component: Welcome,           canActivate: [loginGuard] },
  { path: 'products',            component: ProductComponent,  canActivate: [loginGuard] },
  { path: 'products-pagination', component: ProductPagination, canActivate: [loginGuard] },
  { path: 'maps',                component: MapComponent,               canActivate: [loginGuard] },
  { path: 'numbers',             component: NumberComponent,   canActivate: [loginGuard] },
  { path: 'users',               component: UserComponent,     canActivate: [loginGuard] },
  { path: 'login',               component: Login },
  { path: '',                    redirectTo: 'login',          pathMatch: 'full' },
  { path: '**',                  component: PageNotFound }
];