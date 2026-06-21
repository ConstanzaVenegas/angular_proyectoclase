import { Component, signal } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';
import { faker } from '@faker-js/faker';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-product-pagination',
  standalone: true,
  imports: [DatePipe, NgxPaginationModule, NgFor],
  templateUrl: './product-pagination.html',
  styleUrl: './product-pagination.css',
})
export class ProductPagination {
  products = signal(Array(0));
  p = signal(1);
  total = signal(0);

  constructor() {
    this.products.set(
      Array(50)
        .fill(1)
        .map(_ => {
          return {
            image: faker.image.url(),
            productName: faker.commerce.productName(),
            productCode: 'PROD' + faker.string.numeric(3),
            releaseDate: faker.date.past(),
            price: faker.commerce.price(),
          };
        })
    );
    this.total.set(this.products().length);
  }
}