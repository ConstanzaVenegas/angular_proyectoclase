import { Component, computed, signal } from '@angular/core';
import { IProduct } from './product';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Empresa ACME');

  listFilter = signal('');
  showImage = signal(true);

  products = signal<IProduct[]>([
    {
      productId: 1,
      productName: 'Zapatillas de lona',
      productCode: 'GDN-0011',
      releaseDate: 'March 19, 2016',
      price: 19.95,
      description: 'Zapatillas cómodas para uso diario.',
      starRating: 3.2,
      imageUrl: 'https://www.tripstore.com.ar/media/catalog/product/cache/ee1a7845a4c5b6af95cffd4da69ea963/1/6/166582c_0_8_1.jpg'
    },
    {
      productId: 2,
      productName: 'Bolso de cuero',
      productCode: 'GDN-0023',
      releaseDate: 'March 18, 2016',
      price: 32.99,
      description: 'Bolso resistente y elegante.',
      starRating: 4.2,
      imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_2X_634497-MLA95962975445_102025-F.webp'
    },
    {
      productId: 3,
      productName: 'Reloj antiguo',
      productCode: 'TBX-0048',
      releaseDate: 'May 21, 2016',
      price: 8.9,
      description: 'Reloj clásico decorativo.',
      starRating: 4.8,
      imageUrl: 'https://static7.depositphotos.com/1081688/691/i/450/depositphotos_6912529-stock-photo-alarm-clock.jpg'
    },
    {
      productId: 4,
      productName: 'Cámara fotográfica',
      productCode: 'TBX-0022',
      releaseDate: 'May 15, 2016',
      price: 11.55,
      description: 'Cámara fotográfica clásica.',
      starRating: 3.7,
      imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_2X_682210-MLU71829346226_092023-F.webp'
    }
  ]);

  filteredProducts = computed(() =>
    this.products().filter(producto =>
      producto.productName.toLowerCase().includes(this.listFilter().toLowerCase())
    )
  );

  toggleImage(): void {
    this.showImage.set(!this.showImage());
  }
}