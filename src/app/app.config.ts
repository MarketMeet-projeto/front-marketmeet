import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

// Criar um interceptor funcional que funciona com withInterceptors
export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  
  console.group('🔍 [AuthInterceptor FUNCIONAL] Interceptando requisição');
  console.log('📍 URL:', req.url);
  
  // SOMENTE não adicionar token no login E NO CADASTRO - NADA MAIS
  const isLoginOrSignup = req.url.includes('/login') || req.url.includes('/users/create');
  console.log('🔐 É login ou cadastro?', isLoginOrSignup);

  if (isLoginOrSignup) {
    console.log('⏭️ Pulando interceptor para login/cadastro');
    console.groupEnd();
    return next(req);
  }

  // Obter token - CRÍTICO
  const token = authService.getToken();
  console.log('🔑 Token obtido:', token ? '✅ ' + token.substring(0, 20) + '...' : '❌ NULL');

  if (token) {
    console.log('✅ [AuthInterceptor] Adicionando Authorization header');
    
    // Clonar a requisição com o header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ [AuthInterceptor] Headers:', req.headers.keys());
    console.log('✅ [AuthInterceptor] Authorization:', req.headers.get('Authorization')?.substring(0, 30) + '...');
  } else {
    console.warn('⚠️ [AuthInterceptor] Nenhum token disponível');
  }

  console.groupEnd();
  return next(req);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations()
  ]
};