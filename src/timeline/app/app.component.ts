import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { SidebarCategoriasComponent } from './sidebar-categorias/sidebar-categorias.component';
import { SidebarSugestoesComponent } from './sidebar-sugestoes/sidebar-sugestoes.component';
import { FeedComponent } from './feed/feed.component';
import { AuthService } from '../../login/app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    HeaderComponent,
    SidebarCategoriasComponent,
    SidebarSugestoesComponent,
    FeedComponent
  ]
})
export class AppComponent {
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Navegação para outras páginas com tratamento de erros
  async navigateToProfile() {
    try {
      this.isLoading = true;
      await this.router.navigate(['/perfil']);
    } catch (error) {
      this.error = 'Erro ao navegar para o perfil';
      console.error('Erro de navegação:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async navigateToInicio() {
    try {
      this.isLoading = true;
      await this.router.navigate(['/inicio']);
    } catch (error) {
      this.error = 'Erro ao navegar para o início';
      console.error('Erro de navegação:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async navigateToConfig() {
    try {
      this.isLoading = true;
      await this.router.navigate(['/perfil/config']);
    } catch (error) {
      this.error = 'Erro ao navegar para as configurações';
      console.error('Erro de navegação:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      this.isLoading = true;
      console.log('🚪 Realizando logout...');
      
      // Chamar método de logout do AuthService
      this.authService.logout();
      
      console.log('✅ Logout realizado com sucesso');
      alert('Logout realizado com sucesso!');
      
      // Redirecionar para login
      await this.router.navigate(['/login']);
    } catch (error) {
      this.error = 'Erro ao realizar logout';
      console.error('Erro de logout:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Limpa mensagens de erro
  clearError() {
    this.error = null;
  }
}
