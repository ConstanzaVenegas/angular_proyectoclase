import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, GoogleSigninButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private formBuilder  = inject(FormBuilder);
  private loginService = inject(Auth);
  private router       = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  loginForm: FormGroup = this.formBuilder.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMsg = '';

  ngOnInit() {
    this.socialAuthService.authState.subscribe((socialUser) => {
      if (socialUser) {
        const googletoken = socialUser.idToken;
        if (!googletoken) {
          this.errorMsg = 'No se pudo obtener el token de Google.';
          return;
        }
        this.loginService.loginWithGoogle(googletoken).subscribe({
          next: () => {
            this.errorMsg = '';
            this.router.navigate(['home']);
          },
          error: (err) => {
            console.error('Error login con Google:', err);
            this.errorMsg = 'No se pudo iniciar sesión con Google.';
          }
        });
      }
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loginService.login(email, password).subscribe({
      next: () => {
        this.errorMsg = '';
        this.router.navigate(['home']);
      },
      error: (err) => {
        console.error('Error login:', err);
        if (err.status === 404)      this.errorMsg = 'Usuario no encontrado.';
        else if (err.status === 401) this.errorMsg = 'Contraseña incorrecta.';
        else                         this.errorMsg = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
      }
    });
  }
}