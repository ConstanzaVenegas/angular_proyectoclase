import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct } from '../interfaces/product.interface'; 
import { Star } from './star/star.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, Star],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
})
export class ProductList {
  @Input('datos') products: IProduct[] = [];
  @Input() showImage: boolean = true;
  @Output() datoEmitido = new EventEmitter<string>();

  enviarDato(productName: string): void {
    this.datoEmitido.emit(productName);
  }
}