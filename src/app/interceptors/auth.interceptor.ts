import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor que adiciona o token JWT automaticamente em todos os requests
 * e trata erros de autenticação
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🔧 AuthInterceptor inicializado');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.group('🔍 [AuthInterceptor] Interceptando requisição');
    console.log('📍 URL:', request.url);
    
    // SOMENTE não adicionar token no login E NO CADASTRO - NADA MAIS
    const isLoginOrSignup = request.url.includes('/login') || request.url.includes('/users/create');
    console.log('🔐 É login ou cadastro?', isLoginOrSignup);

    if (isLoginOrSignup) {
      console.log('⏭️ Pulando interceptor para login/cadastro');
      console.groupEnd();
      return next.handle(request);
    }

    // Obter token - CRÍTICO - DEBUG AQUI
    console.log('🔐 Tentando obter token...');
    console.log('🔐 localStorage.auth_token:', localStorage.getItem('auth_token'));
    
    const token = this.authService.getToken();
    console.log('🔑 Token obtido do AuthService:', token ? '✅ ' + token.substring(0, 20) + '...' : '❌ NULL');
    console.log('🔑 Token de localStorage:', localStorage.getItem('auth_token') ? '✅ Existe' : '❌ Não existe');

    if (token) {
      console.log('✅ [AuthInterceptor] Adicionando Authorization header');
      
      // Clonar a requisição com o header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ [AuthInterceptor] Headers:', request.headers.keys());
      console.log('✅ [AuthInterceptor] Authorization:', request.headers.get('Authorization')?.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ [AuthInterceptor] Nenhum token disponível');
      console.warn('⚠️ AuthService.getToken() retornou:', this.authService.getToken());
      console.warn('⚠️ localStorage diretamente:', localStorage.getItem('auth_token'));
      
      // Ainda adicionar Content-Type
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.groupEnd();

    // Passar requisição para o próximo handler
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.group('❌ [AuthInterceptor] Erro na requisição');
        console.log('Status:', error.status);
        console.log('URL:', error.url);
        console.log('Mensagem:', error.message);
        console.log('Resposta:', error.error);

        // 401: Token inválido ou expirado
        if (error.status === 401) {
          console.error('❌ [AuthInterceptor] Acesso negado (401) - Fazendo logout');
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // 403: Proibido
        if (error.status === 403) {
          console.error('❌ [AuthInterceptor] Acesso proibido (403)');
        }

        console.groupEnd();
        return throwError(() => error);
      })
    );
  }
}
