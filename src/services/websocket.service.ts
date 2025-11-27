import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

interface WebSocketEvent {
  event: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private wsUrl = environment.websocketUrl; // Mesmo servidor do backend
  
  // Observables para diferentes tipos de eventos
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private newPostSubject = new Subject<any>();
  public newPost$ = this.newPostSubject.asObservable();

  private likeUpdateSubject = new Subject<any>();
  public likeUpdate$ = this.likeUpdateSubject.asObservable();

  private commentUpdateSubject = new Subject<any>();
  public commentUpdate$ = this.commentUpdateSubject.asObservable();

  private userOnlineSubject = new BehaviorSubject<Set<string>>(new Set());
  public usersOnline$ = this.userOnlineSubject.asObservable();

  private notificationSubject = new Subject<any>();
  public notifications$ = this.notificationSubject.asObservable();

  private errorSubject = new Subject<string>();
  public errors$ = this.errorSubject.asObservable();

  constructor(private authService: AuthService) {
    console.log('🔌 WebSocketService inicializado');
  }

  /**
   * Conectar ao servidor WebSocket
   */
  public connect(): void {
    if (this.socket?.connected) {
      console.log('⚡ WebSocket já está conectado');
      return;
    }

    try {
      const token = this.authService.getToken();
      const user = this.authService.getCurrentUser();

      if (!token || !user) {
        console.warn('⚠️ Usuário não autenticado. Conexão WebSocket adiada.');
        return;
      }

      console.log('🔗 Conectando ao WebSocket:', this.wsUrl);

      this.socket = io(this.wsUrl, {
        auth: {
          token: token,
          userId: user.id_user || user.id
        },
        reconnection: true,
        reconnectionDelay: environment.wsReconnectionDelay,
        reconnectionDelayMax: environment.wsReconnectionDelayMax,
        reconnectionAttempts: environment.wsReconnectionAttempts,
        transports: ['websocket', 'polling']
      });

      // Eventos de conexão
      this.socket.on('connect', () => {
        console.log('✅ Conectado ao WebSocket');
        this.connectionStatusSubject.next(true);
        this.emitEvent('user:online', { userId: user.id_user || user.id });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Desconectado do WebSocket:', reason);
        this.connectionStatusSubject.next(false);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ Erro de conexão WebSocket:', error);
        this.errorSubject.next(`Erro de conexão: ${error.message}`);
      });

      // Eventos de posts em tempo real
      this.socket.on('post:new', (post: any) => {
        console.log('📝 Novo post recebido:', post);
        this.newPostSubject.next(post);
      });

      // Eventos de curtidas
      this.socket.on('post:liked', (data: any) => {
        console.log('❤️ Post curtido:', data);
        this.likeUpdateSubject.next(data);
      });

      this.socket.on('post:unliked', (data: any) => {
        console.log('🤍 Post descurtido:', data);
        this.likeUpdateSubject.next(data);
      });

      // Eventos de comentários
      this.socket.on('comment:new', (comment: any) => {
        console.log('💬 Novo comentário:', comment);
        this.commentUpdateSubject.next(comment);
      });

      this.socket.on('comment:deleted', (data: any) => {
        console.log('🗑️ Comentário deletado:', data);
        this.commentUpdateSubject.next(data);
      });

      // Eventos de usuários online
      this.socket.on('users:online', (users: string[]) => {
        console.log('👥 Usuários online:', users);
        this.userOnlineSubject.next(new Set(users));
      });

      // Notificações gerais
      this.socket.on('notification', (notification: any) => {
        console.log('🔔 Notificação:', notification);
        this.notificationSubject.next(notification);
      });

      // Eventos de seguidor
      this.socket.on('user:followed', (data: any) => {
        console.log('👤 Novo seguidor:', data);
        this.notificationSubject.next({
          type: 'follow',
          user: data.user,
          message: `${data.user.username} começou a seguir você`
        });
      });

    } catch (error: any) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.errorSubject.next(`Erro ao conectar: ${error.message}`);
    }
  }

  /**
   * Desconectar do WebSocket
   */
  public disconnect(): void {
    if (this.socket?.connected) {
      console.log('🔌 Desconectando do WebSocket');
      this.socket.disconnect();
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Emitir um evento para o servidor
   */
  public emitEvent(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`⚠️ WebSocket não está conectado. Evento "${event}" não foi enviado.`);
      return;
    }

    console.log(`📤 Emitindo evento: ${event}`, data);
    this.socket.emit(event, data);
  }

  /**
   * Escutar um evento customizado
   */
  public onEvent(event: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('WebSocket não inicializado');
        return;
      }

      this.socket.on(event, (data: any) => {
        console.log(`📥 Evento recebido: ${event}`, data);
        observer.next(data);
      });
    });
  }

  /**
   * Publicar um novo post e notificar via WebSocket
   */
  public publishPost(post: any): void {
    this.emitEvent('post:create', post);
  }

  /**
   * Curtir um post
   */
  public likePost(postId: string): void {
    this.emitEvent('post:like', { postId });
  }

  /**
   * Descurtir um post
   */
  public unlikePost(postId: string): void {
    this.emitEvent('post:unlike', { postId });
  }

  /**
   * Adicionar um comentário
   */
  public addComment(postId: string, comment: string): void {
    this.emitEvent('comment:add', { postId, comment });
  }

  /**
   * Deletar um comentário
   */
  public deleteComment(postId: string, commentId: string): void {
    this.emitEvent('comment:delete', { postId, commentId });
  }

  /**
   * Seguir um usuário
   */
  public followUser(userId: string): void {
    this.emitEvent('user:follow', { userId });
  }

  /**
   * Deixar de seguir um usuário
   */
  public unfollowUser(userId: string): void {
    this.emitEvent('user:unfollow', { userId });
  }

  /**
   * Enviar mensagem privada
   */
  public sendMessage(userId: string, message: string): void {
    this.emitEvent('message:send', { userId, message });
  }

  /**
   * Tipagem de mensagem (mostrar "digitando...")
   */
  public setTyping(postId: string, isTyping: boolean): void {
    this.emitEvent('user:typing', { postId, isTyping });
  }

  /**
   * Compartilhar um post
   */
  public sharePost(postId: string): void {
    this.emitEvent('post:share', { postId });
  }

  /**
   * Obter status de conexão
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Obter ID do socket
   */
  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Enviar notificação broadcast
   */
  public broadcastNotification(notification: any): void {
    this.emitEvent('notification:broadcast', notification);
  }

  /**
   * Sincronizar estado online/offline
   */
  public updatePresence(status: 'online' | 'away' | 'offline'): void {
    this.emitEvent('user:presence', { status });
  }

  /**
   * Obter lista de usuários online
   */
  public getOnlineUsers(): Set<string> {
    return this.userOnlineSubject.value;
  }

  /**
   * Verificar se um usuário está online
   */
  public isUserOnline(userId: string): boolean {
    return this.userOnlineSubject.value.has(userId);
  }
}
