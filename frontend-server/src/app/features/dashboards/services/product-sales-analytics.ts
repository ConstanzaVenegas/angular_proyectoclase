import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductSalesAnalyticsService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getSalesData() {
    return [
      { name: 'Laptop', value: 120 },
      { name: 'Smartphone', value: 95 },
      { name: 'Tablet', value: 60 },
      { name: 'Monitor', value: 45 },
      { name: 'Teclado', value: 30 }
    ];
  }

  getTopProductsByRating(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiUrl}/productos/top/ranking`, { headers });
  }
}