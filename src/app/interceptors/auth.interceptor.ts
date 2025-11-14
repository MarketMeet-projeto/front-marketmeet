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
<<<<<<< HEAD
    console.group('🔍 [AuthInterceptor] Interceptando requisição');
    console.log('📍 URL:', request.url);
    
    // SOMENTE não adicionar token no login E NO CADASTRO - NADA MAIS
    const isLoginOrSignup = request.url.includes('/login') || request.url.includes('/users/create');
    console.log('🔐 É login ou cadastro?', isLoginOrSignup);

    if (isLoginOrSignup) {
      console.log('⏭️ Pulando interceptor para login/cadastro');
      console.groupEnd();
      return next.handle(request);
=======
    // Obter o token JWT do localStorage
    const token = this.authService.getToken();

    console.log('🔍 [AuthInterceptor] URL:', request.url);
    console.log('🔍 [AuthInterceptor] Token existe?', !!token);

    // Se houver token, adicionar no header Authorization
    if (token) {
      console.log('✅ [AuthInterceptor] Adicionando token ao header Authorization');
      console.log('🔑 [AuthInterceptor] Token:', token.substring(0, 20) + '...');
      
      // Clonar a requisição e adicionar o header Authorization
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ [AuthInterceptor] Headers atualizados:', request.headers.keys());
      console.log('✅ [AuthInterceptor] Authorization header:', request.headers.get('Authorization')?.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ [AuthInterceptor] Nenhum token encontrado para URL:', request.url);
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
    }

    // Obter token - CRÍTICO
    const token = this.authService.getToken();
    console.log('🔑 Token obtido:', token ? '✅ ' + token.substring(0, 20) + '...' : '❌ NULL');

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
<<<<<<< HEAD
        console.group('❌ [AuthInterceptor] Erro na requisição');
        console.log('Status:', error.status);
        console.log('URL:', error.url);
        console.log('Mensagem:', error.message);
        console.log('Resposta:', error.error);

        // 401: Token inválido ou expirado
        if (error.status === 401) {
          console.error('❌ [AuthInterceptor] Acesso negado (401) - Fazendo logout');
=======
        console.error('❌ [AuthInterceptor] Erro na requisição:', error.status, error.message);
        console.error('❌ [AuthInterceptor] URL:', error.url);
        console.error('❌ [AuthInterceptor] Resposta completa:', error);

        // Se for erro 401 (Não autorizado), fazer logout
        if (error.status === 401) {
          console.error('❌ [AuthInterceptor] Token inválido ou expirado (401)');
          console.error('Resposta do servidor:', error.error);
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // 403: Proibido
        if (error.status === 403) {
          console.error('❌ [AuthInterceptor] Acesso proibido (403)');
<<<<<<< HEAD
=======
          console.error('Resposta do servidor:', error.error);
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
        }

        console.groupEnd();
        return throwError(() => error);
      })
    );
  }
}
