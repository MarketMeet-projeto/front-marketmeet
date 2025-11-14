import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
<<<<<<< HEAD
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
=======
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withXsrfConfiguration } from '@angular/common/http';
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    provideAnimations(),
    // Registrar o AuthInterceptor (API antiga mas funciona em todas versões)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};