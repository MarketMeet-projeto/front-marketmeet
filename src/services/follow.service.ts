import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = environment.apiBaseUrl; // Base URL do backend

  // Armazenar IDs de usuários que o usuário atual está seguindo
  private followingSubject = new BehaviorSubject<Set<string>>(new Set());
  public following$ = this.followingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadFollowing();
  }

  /**
   * Carregar lista de usuários que estou seguindo
   */
  private loadFollowing(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    console.log('[FollowService] Carregando seguindo...');
    // TODO: Implementar no backend: GET /api/users/:userId/following
    // Por enquanto, iniciamos com um Set vazio
    this.followingSubject.next(new Set());
  }

  /**
   * Seguir um usuário
   */
  followUser(userId: string): Observable<any> {
    console.log('[FollowService] Seguindo usuário:', userId);

    const currentUser = this.authService.getCurrentUser();
    const currentUserId = String(currentUser?.id_user || currentUser?.id);

    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}/users/${userId}/follow`, {
        follower_user_id: currentUserId
      }).subscribe({
        next: (response) => {
          console.log('[FollowService] Usuário seguido com sucesso:', response);
          
          // Adicionar o usuário à lista de seguindo
          const currentFollowing = this.followingSubject.value;
          currentFollowing.add(userId);
          this.followingSubject.next(new Set(currentFollowing));

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[FollowService] Erro ao seguir usuário:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Deixar de seguir um usuário
   */
  unfollowUser(userId: string): Observable<any> {
    console.log('[FollowService] Deixando de seguir usuário:', userId);

    const currentUser = this.authService.getCurrentUser();
    const currentUserId = String(currentUser?.id_user || currentUser?.id);

    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}/users/${userId}/unfollow`, {
        follower_user_id: currentUserId
      }).subscribe({
        next: (response) => {
          console.log('[FollowService] Deixou de seguir usuário com sucesso:', response);
          
          // Remover o usuário da lista de seguindo
          const currentFollowing = this.followingSubject.value;
          currentFollowing.delete(userId);
          this.followingSubject.next(new Set(currentFollowing));

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[FollowService] Erro ao deixar de seguir usuário:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Verificar se está seguindo um usuário
   */
  isFollowing(userId: string): boolean {
    return this.followingSubject.value.has(userId);
  }

  /**
   * Obter lista de usuários que estou seguindo
   */
  getFollowing(): Set<string> {
    return this.followingSubject.value;
  }
}
