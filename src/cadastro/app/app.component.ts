import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // Importar HttpClient

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cadastroForm: FormGroup;
  submitted = false;
  showPassword = false;

  private apiUrl = 'http://10.51.47.41:3000/api/users/create'; // URL do backend

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.cadastroForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    if (this.cadastroForm.valid) {
      // Enviar dados para o backend
      this.http.post(this.apiUrl, this.cadastroForm.value).subscribe({
        next: (res) => {
          alert('Conta criada com sucesso!');
          this.cadastroForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.error(err);
          alert('Ocorreu um erro ao criar a conta.');
        }
      });
    }
  }

  get username() { return this.cadastroForm.get('username'); }
  get email() { return this.cadastroForm.get('email'); }
  get password() { return this.cadastroForm.get('password'); }
  get birth_date() { return this.cadastroForm.get('birth_date'); }

  voltarParaLogin() {
    this.router.navigate(['/login']);
  }

  formatDate(event: any) {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + (value.length > 2 ? '/' : '') + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + (value.length > 5 ? '/' : '') + value.substring(5);
    }

    this.cadastroForm.patchValue({
      birth_date: value
    }, { emitEvent: false });
  }
}
