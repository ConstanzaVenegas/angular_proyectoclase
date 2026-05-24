import { Routes } from '@angular/router';
import { ProductComponent } from './features/products/components/product/product';
import { Welcome } from './features/home/welcome/welcome';
import { PageNotFound } from './features/not-found/page-not-found/page-not-found';
import { Login } from './features/auth/components/login/login';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'home',     component: Welcome,          canActivate: [authGuard] },
  { path: 'products', component: ProductComponent,  canActivate: [authGuard] },
  { path: 'login',    component: Login,             canActivate: [noAuthGuard] },
  { path: '',         redirectTo: 'login',          pathMatch: 'full' },
  { path: '**',       component: PageNotFound }
];