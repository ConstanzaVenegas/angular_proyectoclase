import { Component, inject, signal, computed, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './verify-code.html',
  styleUrl: './verify-code.css'
})
export class VerifyCode implements OnInit, OnDestroy {
  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private appRef  = inject(ApplicationRef);

  email = sessionStorage.getItem('recovery_email') || '';

  // step, loading, errores y el contador ahora son signals: Angular
  // refresca la vista automaticamente cuando cambian, sin depender de zone.js.
  step       = signal(1);
  loading    = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  secondsLeft = signal(600);

  codeForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  passwordForm: FormGroup = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordsMatch });

  resetToken  = '';

  private timer: any;

  minutes  = computed(() => Math.floor(this.secondsLeft() / 60).toString().padStart(2, '0'));
  seconds  = computed(() => (this.secondsLeft() % 60).toString().padStart(2, '0'));
  expired  = computed(() => this.secondsLeft() <= 0);
  urgente  = computed(() => this.secondsLeft() <= 60);

  ngOnInit() {
    if (!this.email) { this.router.navigate(['/recover-password']); return; }
    this.startCountdown();
  }

  ngOnDestroy() { clearInterval(this.timer); }

  startCountdown() {
    this.secondsLeft.set(600);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.secondsLeft.update(s => s - 1);
      if (this.secondsLeft() <= 0) {
        clearInterval(this.timer);
        this.codeForm.get('code')?.disable();
      }
      // Forzamos un tick por si zone.js no detecta el setInterval en este entorno.
      this.appRef.tick();
    }, 1000);
  }

  reenviar() {
    this.errorMsg.set('');
    this.http.post<any>('http://localhost:3000/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.startCountdown();
        this.codeForm.reset();
        this.appRef.tick();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.mensaje || 'Error al reenviar.');
        this.appRef.tick();
      }
    });
  }

  verificarCodigo() {
    if (this.codeForm.invalid) { this.codeForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { code } = this.codeForm.value;
    this.http.post<any>('http://localhost:3000/verify-code', { email: this.email, code }).subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.resetToken = resp.resetToken;
        this.step.set(2);
        clearInterval(this.timer);
        // Forzamos manualmente la deteccion de cambios para asegurar
        // que la vista se actualice sin importar el estado de zone.js.
        this.appRef.tick();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.mensaje || 'Error al verificar.');
        this.appRef.tick();
      }
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { newPassword } = this.passwordForm.value;
    this.http.post<any>('http://localhost:3000/reset-password', {
      resetToken: this.resetToken,
      newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Contraseña actualizada! Redirigiendo...');
        sessionStorage.removeItem('recovery_email');
        this.appRef.tick();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.mensaje || 'Error al cambiar contraseña.');
        this.appRef.tick();
      }
    });
  }

  passwordsMatch(group: FormGroup) {
    const pw  = group.get('newPassword')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { noMatch: true };
  }
}