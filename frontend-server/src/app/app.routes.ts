import { Routes } from '@angular/router';
import { ProductComponent } from './features/products/components/product/product';
import { Welcome } from './features/home/welcome/welcome';
import { PageNotFound } from './features/not-found/page-not-found/page-not-found';
import { Login } from './features/auth/components/login/login';
import { loginGuard } from './features/auth/guards/login-guard';

export const routes: Routes = [
  { path: 'home',     component: Welcome,          canActivate: [loginGuard] },
  { path: 'products', component: ProductComponent,  canActivate: [loginGuard] },
  { path: 'login',    component: Login },
  { path: '',         redirectTo: 'login',          pathMatch: 'full' },
  { path: '**',       component: PageNotFound }
];