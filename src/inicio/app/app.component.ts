import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class AppComponent {
  constructor(private router: Router) {}

  onExplorarIndicacoes() {
    this.router.navigate(['/indicacoes']);
  }

  onVerComoFunciona() {
    this.router.navigate(['/como-funciona']);
  }

  onComunidade() {
    this.router.navigate(['/comunidade']);
  }

  onEntrar() {
    this.router.navigate(['/login']);
  }

  onPrimeiroAcesso() {
    this.router.navigate(['/cadastro']);
  }
}
