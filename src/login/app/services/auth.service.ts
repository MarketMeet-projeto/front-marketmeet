import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://10.51.47.41:3000/api/users';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar se há token salvo ao inicializar
    this.loadStoredUser();
  }

  /**
   * Fazer login e salvar o token JWT
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        console.log('✅ Resposta do login:', response);
        
        // Salvar o token JWT
        if (response?.token) {
          localStorage.setItem(this.tokenKey, response.token);
          console.log('🔐 Token JWT salvo em localStorage');
        }
        
        // Salvar dados do usuário
        if (response?.user) {
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          console.log('👤 Usuário salvo:', response.user);
        }
      })
    );
  }

  /**
   * Fazer logout e remover o token
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    console.log('🚪 Logout realizado, token removido');
  }

  /**
   * Obter o token JWT do localStorage
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('🔍 [AuthService.getToken()] Token recuperado:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Carregar usuário salvo no localStorage
   */
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        console.log('👤 Usuário carregado do localStorage:', user);
      } catch (error) {
        console.error('❌ Erro ao carregar usuário do localStorage:', error);
      }
    }
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Obter ID do usuário atual
   */
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id_user || null;
  }
}