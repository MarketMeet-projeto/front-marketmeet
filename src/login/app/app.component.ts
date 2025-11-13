import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  private apiUrl = 'http://10.51.47.41:3000/api/users/login'; // URL do backend

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('📤 Tentando fazer login com:', { email });
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('📥 Resposta do servidor:', response);
          console.log('✅ Login realizado com sucesso!');
          console.log('🔐 Token salvo:', this.authService.getToken()?.substring(0, 20) + '...');
          const user = this.authService.getCurrentUser();
          console.log('👤 Usuário logado:', user);
          alert(`Login realizado com sucesso!\nBem-vindo, ${user?.username || 'Usuário'}!`);
          // Navegar para timeline após sucesso
          this.router.navigate(['/timeline']);
        },
        error: (error) => {
          console.error('❌ Erro ao fazer login:', error);
          const errorMessage = error.error?.error || error.error?.message || error.message || 'Erro desconhecido';
          alert(`Erro ao fazer login:\n${errorMessage}`);
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  getFieldError(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return field === 'email' ? 'E-mail é obrigatório' : 'Senha é obrigatória';
      }
      if (control.errors['email']) {
        return 'Digite um e-mail válido';
      }
      if (control.errors['minlength']) {
        return 'Senha deve ter pelo menos 6 caracteres';
      }
    }
    return '';
  }

  onForgotPassword() {
    alert('Funcionalidade de recuperação de senha');
  }

  onSignUp(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/cadastro']);
  }
}