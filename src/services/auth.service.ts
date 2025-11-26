import { Injectable, NgZone } from '@angular/core';
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

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('🔧 AuthService inicializado');
    // Verificar se há token salvo ao inicializar
    this.loadStoredUser();
    this.printStorageState();
  }

  /**
   * Fazer login e salvar o token JWT
   */
  login(email: string, password: string): Observable<any> {
    console.log('🚀 AuthService.login() chamado para email:', email);
    
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        console.log('✅ [AuthService] Resposta do login recebida:', response);
        
        // Salvar o token JWT - GARANTIDO
        if (response?.token) {
          try {
            localStorage.setItem(this.tokenKey, response.token);
            console.log('✅ [AuthService] Token salvo em localStorage');
            console.log('✅ [AuthService] Token value:', response.token.substring(0, 30) + '...');
          } catch (error) {
            console.error('❌ [AuthService] Erro ao salvar token em localStorage:', error);
          }
        } else {
          console.warn('⚠️ [AuthService] Nenhum token na resposta do servidor');
        }
        
        // Salvar dados do usuário - GARANTIDO
        if (response?.user) {
          try {
            localStorage.setItem('current_user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            console.log('✅ [AuthService] Usuário salvo:', response.user);
          } catch (error) {
            console.error('❌ [AuthService] Erro ao salvar usuário:', error);
          }
        }
        
        this.printStorageState();
      })
    );
  }

  /**
   * Fazer logout e remover o token
   */
  logout(): void {
    console.log('🚪 AuthService.logout() chamado');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    console.log('🚪 Logout realizado, token removido');
  }

  /**
   * Obter o token JWT do localStorage - CRÍTICO
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    const display = token ? token.substring(0, 20) + '...' : 'NULL';
    console.log('🔐 [AuthService.getToken()] Lendo token:', display);
    return token;
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = !!token;
    console.log('🔓 [AuthService.isAuthenticated()]', isAuth);
    return isAuth;
  }

  /**
   * Carregar usuário salvo no localStorage
   */
  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        console.log('👤 [AuthService] Usuário carregado do localStorage:', user);
      } else {
        console.log('👤 [AuthService] Nenhum usuário salvo no localStorage');
      }
    } catch (error) {
      console.error('❌ [AuthService] Erro ao carregar usuário:', error);
    }
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): any {
    const user = this.currentUserSubject.value;
    console.log('👥 [AuthService.getCurrentUser()]', user);
    return user;
  }

  /**
   * Obter ID do usuário atual
   */
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    const id = user?.id_user?.toString() || null;
    console.log('🆔 [AuthService.getCurrentUserId()]', id);
    return id;
  }

  /**
   * Atualizar perfil do usuário no backend
   */
  updateUserProfile(profileData: any): Observable<any> {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    // Extrair o ID do usuário
    const userId = user?.id_user || user?.id || user?.user_id;
    
    console.log('📤 [AuthService] Enviando atualização de perfil para:', `${this.apiUrl}/update`);
    console.log('🆔 User ID:', userId);
    console.log('📄 Dados do formulário:', profileData);
    
    // Preparar payload com os campos que o backend aceita
    const dataWithUserId = {
      id_user: userId,
      username: profileData.username,
      email: profileData.email,
      birth_date: profileData.birth_date || null
    };

    console.log('📤 Payload final sendo enviado:', JSON.stringify(dataWithUserId, null, 2));

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return this.http.put<any>(`${this.apiUrl}/update`, dataWithUserId, { headers }).pipe(
      tap((response: any) => {
        console.log('✅ [AuthService] Resposta do servidor recebida:', response);
        
        // Atualizar o usuário no BehaviorSubject com todos os dados
        if (response?.user) {
          const usuarioAtualizado = {
            ...user,
            ...response.user,
            username: profileData.username,
            name: profileData.fullName,
            bio: profileData.bio,
            email: profileData.email,
            phone: profileData.phone
          };
          
          this.currentUserSubject.next(usuarioAtualizado);
          localStorage.setItem('current_user', JSON.stringify(usuarioAtualizado));
          console.log('✅ [AuthService] Usuário atualizado localmente');
        }
      })
    );
  }

  /**
   * DEBUG: Imprimir estado do localStorage
   */
  private printStorageState(): void {
    console.group('📦 Storage State');
    console.log('auth_token:', localStorage.getItem(this.tokenKey) ? '✅ EXISTS' : '❌ NOT FOUND');
    console.log('current_user:', localStorage.getItem('current_user') ? '✅ EXISTS' : '❌ NOT FOUND');
    console.groupEnd();
  }
}
