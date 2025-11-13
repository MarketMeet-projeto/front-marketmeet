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
import { AuthService } from '../../login/app/services/auth.service';

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
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
    }

    // Passar a requisição para o próximo handler
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [AuthInterceptor] Erro na requisição:', error.status, error.message);
        console.error('❌ [AuthInterceptor] URL:', error.url);
        console.error('❌ [AuthInterceptor] Resposta completa:', error);

        // Se for erro 401 (Não autorizado), fazer logout
        if (error.status === 401) {
          console.error('❌ [AuthInterceptor] Token inválido ou expirado (401)');
          console.error('Resposta do servidor:', error.error);
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Se for erro 403 (Proibido)
        if (error.status === 403) {
          console.error('❌ [AuthInterceptor] Acesso proibido (403)');
          console.error('Resposta do servidor:', error.error);
        }

        return throwError(() => error);
      })
    );
  }
}
