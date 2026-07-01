import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css'
})
export class RecoverPassword {
  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading  = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    this.http.post<any>('http://localhost:3000/forgot-password', this.form.value).subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.setItem('recovery_email', this.form.value.email);
        this.router.navigate(['/verify-code']);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.mensaje || 'Error al enviar el código.';
      }
    });
  }
}