import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importar HttpClient

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // adicionar HttpClientModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cadastroForm: FormGroup;
  submitted = false;
  showPassword = false;

  private apiUrl = 'http://10.51.47.1/:3000/api/users/create'; // URL do backend

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.cadastroForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthDate: ['', Validators.required]
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
  get birthDate() { return this.cadastroForm.get('birthDate'); }
}
