import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http   = inject(HttpClient);
  private router = inject(Router);


  isAuthenticated = signal(false);

  constructor() {

    const token = localStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      this.isAuthenticated.set(true);
    } else {

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      this.isAuthenticated.set(false);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp es en segundos, Date.now() en milisegundos
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // Si no se puede leer el token, se considera expirado
    }
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:3000/login', { email, password }).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        this.isAuthenticated.set(true);
      })
    );
  }

  // Login con Google: enviamos el idToken de Google a nuestro backend
  loginWithGoogle(googletoken: string) {
    return this.http.post<any>('http://localhost:3000/google-login', { googletoken }).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAuthenticated.set(false);
  }
}