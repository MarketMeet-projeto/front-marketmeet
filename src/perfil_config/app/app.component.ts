import { Component, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class AppComponent implements OnInit {
  title = 'Configurações do Perfil';
  profileForm: FormGroup;
  profileImage: string | null = null;

  // Validador para nome completo
  validateFullName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      // Verifica se tem pelo menos duas palavras
      const words = value.trim().split(/\s+/);
      if (words.length < 2) {
        return { fullName: true };
      }

      // Verifica se cada palavra tem pelo menos 2 caracteres
      if (words.some((word: string) => word.length < 2)) {
        return { wordLength: true };
      }

      // Verifica se contém apenas letras e espaços
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(value)) {
        return { invalidChars: true };
      }

      return null;
    };
  }

  // Validador para nome de usuário
  validateUsername(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      // Verifica se tem entre 3 e 20 caracteres
      if (value.length < 3 || value.length > 20) {
        return { usernameLength: true };
      }

      // Permite apenas letras, números e underscore
      if (!/^[a-zA-Z0-9_]*$/.test(value)) {
        return { invalidUsername: true };
      }

      return null;
    };
  }

  // Validador para bio
  validateBio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Bio não é obrigatória

      // Máximo de 250 caracteres
      if (value.length > 250) {
        return { bioLength: true };
      }

      return null;
    };
  }

  // Validador para telefone
  validatePhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };
      
      // Remove tudo que não é dígito
      const digits = value.replace(/\D/g, '');
      
      // Verifica se tem o código do país (55) e pelo menos 10 dígitos após (DDD + número)
      if (digits.length < 12) {
        return { minlength: true };
      }
      
      // Verifica se o formato está correto (+55 XX XXXXX-XXXX)
      const formatRegex = /^\+55\s\d{2}\s\d{4,5}-\d{4}$/;
      if (!formatRegex.test(value)) {
        return { format: true };
      }
      
      return null;
    };
  }

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      fullName: ['Ana Sha', [Validators.required, this.validateFullName()]],
      username: ['anasha', [Validators.required, this.validateUsername()]],
      bio: ['Apaixonada por tecnologia e sempre em busca dos melhores produtos.', [this.validateBio()]],
      email: ['ana@gmail.com', [Validators.required, Validators.email]],
      phone: ['+55 11 99999-9999', [Validators.required, this.validatePhone()]]
    });
  }

  ngOnInit() {
    // Inicialização adicional se necessário
  }

  // Getters para acessar os campos do formulário
  get fullName() {
    return this.profileForm.get('fullName')?.value || '';
  }

  get username() {
    return this.profileForm.get('username')?.value || '';
  }

  // Getters para os controles do formulário
  get fullNameControl() { return this.profileForm.get('fullName'); }
  get usernameControl() { return this.profileForm.get('username'); }
  get bioControl() { return this.profileForm.get('bio'); }
  get emailControl() { return this.profileForm.get('email'); }
  get phoneControl() { return this.profileForm.get('phone'); }

  // Mensagens de erro para nome completo
  get fullNameErrors(): string {
    const control = this.fullNameControl;
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'O nome completo é obrigatório';
      }
      if (control.errors['fullName']) {
        return 'Digite seu nome e sobrenome';
      }
      if (control.errors['wordLength']) {
        return 'Cada nome deve ter pelo menos 2 letras';
      }
      if (control.errors['invalidChars']) {
        return 'Use apenas letras no nome';
      }
    }
    return '';
  }

  // Mensagens de erro para nome de usuário
  get usernameErrors(): string {
    const control = this.usernameControl;
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'O nome de usuário é obrigatório';
      }
      if (control.errors['usernameLength']) {
        return 'O nome de usuário deve ter entre 3 e 20 caracteres';
      }
      if (control.errors['invalidUsername']) {
        return 'Use apenas letras, números e underscore';
      }
    }
    return '';
  }

  // Mensagens de erro para bio
  get bioErrors(): string {
    const control = this.bioControl;
    if (control?.errors && control.touched) {
      if (control.errors['bioLength']) {
        return 'A bio deve ter no máximo 250 caracteres';
      }
    }
    return '';
  }

  // Mensagens de erro para email
  get emailErrors(): string {
    const control = this.emailControl;
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'O email é obrigatório';
      }
      if (control.errors['email']) {
        return 'Digite um email válido';
      }
    }
    return '';
  }

  // Mensagens de erro para telefone
  get phoneErrors(): string {
    const control = this.phoneControl;
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'O telefone é obrigatório';
      }
      if (control.errors['minlength']) {
        return 'O número deve ter pelo menos 10 dígitos (DDD + número)';
      }
      if (control.errors['format']) {
        return 'Formato inválido. Use: +55 XX XXXXX-XXXX';
      }
    }
    return '';
  }

  onPhotoChange() {
    console.log('Mudando foto do perfil');
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Formulário enviado:', this.profileForm.value);
      // Após salvar com sucesso, redireciona para a página inicial
      this.router.navigate(['/inicio']);
    }
  }

  // Método para voltar à página anterior
  onVoltar() {
    this.router.navigate(['/inicio']);
  }

  // Método para ir para a página de login (caso precise fazer logout)
  onLogout() {
    // Aqui você pode adicionar a lógica de logout quando implementar
    this.router.navigate(['/login']);
  }

  /**
   * Handler para mascarar o telefone enquanto o usuário digita.
   * Formato: +55 XX XXXXX-XXXX
   */
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove tudo exceto dígitos
    let digits = value.replace(/\D/g, '');
    
    // Limita a 13 dígitos (55 + DDD + número)
    digits = digits.substring(0, 13);
    
    // Adiciona 55 se não começar com ele
    if (!digits.startsWith('55') && digits.length > 0) {
      digits = '55' + digits;
    }
    
    // Aplica a máscara
    let formatted = '';
    if (digits.length > 0) {
      // Adiciona +55
      formatted = '+55';
      
      if (digits.length > 2) {
        // Adiciona DDD
        formatted += ' ' + digits.substring(2, 4);
        
        if (digits.length > 4) {
          // Adiciona primeira parte do número
          formatted += ' ' + digits.substring(4, 9);
          
          if (digits.length > 9) {
            // Adiciona parte final do número
            formatted += '-' + digits.substring(9);
          }
        }
      }
    }

    // Atualiza o valor no input e no FormControl
    input.value = formatted;
    this.profileForm.get('phone')?.setValue(formatted, { emitEvent: false });
  }
}
