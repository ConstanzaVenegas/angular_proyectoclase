import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IProduct } from '../interfaces/product.interface';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000';

  products  = signal<IProduct[]>([]);
  // producto seleccionado para Ver / Editar
  selected  = signal<IProduct | null>(null);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getProducts() {
    return this.http.get<IProduct[]>(`${this.url}/productos`, {
      headers: this.getHeaders()
    }).pipe(
      tap(data => this.products.set(data))
    );
  }

  saveProduct(product: IProduct) {
    return this.http.post(`${this.url}/producto`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(product: IProduct) {
    return this.http.put(`${this.url}/producto/${product.id_producto}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.url}/producto/${id}`, {
      headers: this.getHeaders()
    });
  }
}