import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ModalAddComponent } from '../modal-add/modal-add';
import { Star } from '../../product-list/star/star.component';
import { ImagePipe } from '../../../../shared/image-pipe';
import { IProduct } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ModalAddComponent, FormsModule, Star, ImagePipe, CurrencyPipe],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class ProductComponent implements OnInit {
  listFilter    = signal('');
  showImages    = signal(true);
  showModal     = signal(false);
  showVerModal  = signal(false);
  showEditModal = signal(false);
  productoSeleccionado = signal<IProduct | null>(null);

  
  editForm: IProduct = {
    id_producto: undefined,
    nombre_producto: '',
    codigo_producto: '',
    cantidad_producto: 0,
    precio_producto: 0,
    starRating: 1,
    url_imagen: ''
  };

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe();
  }

  filteredProducts = computed(() =>
    this.productService.products().filter(p =>
      p.nombre_producto.toLowerCase().includes(this.listFilter().toLowerCase())
    )
  );

  toggleImages(): void { this.showImages.update(v => !v); }

  abrirModal()  { this.showModal.set(true); }
  cerrarModal() {
    this.showModal.set(false);
    this.productService.getProducts().subscribe();
  }

  verProducto(p: IProduct) {
    this.productoSeleccionado.set({ ...p });
    this.showVerModal.set(true);
  }

  editarProducto(p: IProduct) {
    
    this.editForm = { ...p };
    this.productoSeleccionado.set(p);
    this.showEditModal.set(true);
  }

  guardarEdicion() {
    this.productService.updateProduct(this.editForm).subscribe({
      next: () => {
        this.showEditModal.set(false);
        this.productService.getProducts().subscribe();
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Error al guardar cambios. Revisa la consola.');
      }
    });
  }

  borrarProducto(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.productService.getProducts().subscribe(),
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el producto.');
        }
      });
    }
  }
}
