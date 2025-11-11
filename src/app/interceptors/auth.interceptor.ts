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
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obter o token JWT
    const token = this.authService.getToken();

    // Se houver token, adicionar no header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔐 Token JWT adicionado ao header Authorization');
    }

    // Passar a requisição para o próximo handler
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se for erro 401 (Não autorizado), fazer logout
        if (error.status === 401) {
          console.error('❌ Token inválido ou expirado (401)');
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Se for erro 403 (Proibido)
        if (error.status === 403) {
          console.error('❌ Acesso proibido (403)');
        }

        return throwError(() => error);
      })
    );
  }
}
