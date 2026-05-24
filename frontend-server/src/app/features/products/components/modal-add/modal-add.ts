import { Component, inject, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-modal-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-add.html',
  styleUrl: './modal-add.css'
})
export class ModalAddComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private productService = inject(ProductService);
  closeModal = output<void>();
  productForm!: FormGroup;

  ngOnInit() {
    this.productForm = this.fb.group({
      nombre_producto:   ['', [Validators.required, Validators.minLength(3)]],
      codigo_producto:   ['', [Validators.required]],
      cantidad_producto: [1,  [Validators.required, Validators.min(0)]],
      precio_producto:   [0,  [Validators.required, Validators.min(0)]],
      starRating:        [1,  [Validators.required, Validators.min(1), Validators.max(5)]],
      url_imagen:        ['']
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      
      this.productForm.markAllAsTouched();
      return;
    }
    this.productService.saveProduct(this.productForm.value).subscribe({
      next: () => {
        this.productService.getProducts().subscribe();
        this.closeModal.emit();
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
        alert('Error al guardar. Revisa la consola.');
      }
    });
  }
}
