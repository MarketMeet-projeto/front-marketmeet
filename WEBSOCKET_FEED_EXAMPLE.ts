import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { likeAnimation, publishAnimation, heartBeatAnimation } from '../animations/post.animations';
import { FeedService } from '../services/feed.service';
import { AuthService } from '../../../services/auth.service';
import { WebSocketService } from '../../../services/websocket.service';

// ... (imports de interfaces - mantém tudo igual) ...

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  animations: [likeAnimation, publishAnimation, heartBeatAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedComponentWithWebSocket implements OnInit, OnDestroy {
  posts: Post[] = [];
  modalAberto = false;
  isWebSocketConnected = false;
  
  // ... (outros properties) ...

  private destroy$ = new Subject<void>();

  constructor(
    private feedService: FeedService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {
    // Inscrever-se aos posts do serviço HTTP (inicial)
    this.feedService.posts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((posts: any) => {
        this.posts = posts.map((post: any) => ({
          ...post,
          interacoes: {
            ...post.interacoes,
            comments: [],
            animationState: 'inactive' as const
          },
          showComments: false
        }));
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    // Obter informações do usuário
    const authenticatedUser = this.authService.getCurrentUser();
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
    }

    // ===== CONECTAR AO WEBSOCKET =====
    this.webSocketService.connect();

    // Escutar status de conexão
    this.webSocketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.isWebSocketConnected = connected;
        console.log(connected ? '✅ WebSocket conectado' : '❌ WebSocket desconectado');
        this.cdr.markForCheck();
      });

    // ===== NOVOS POSTS EM TEMPO REAL =====
    this.webSocketService.newPost$
      .pipe(takeUntil(this.destroy$))
      .subscribe((post: any) => {
        console.log('📝 Novo post recebido via WebSocket:', post);
        const newPost = this.mapPostFromWebSocket(post);
        this.posts = [newPost, ...this.posts];
        this.cdr.markForCheck();
      });

    // ===== ATUALIZAÇÕES DE CURTIDAS EM TEMPO REAL =====
    this.webSocketService.likeUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log('❤️ Curtida atualizada via WebSocket:', data);
        this.posts = this.posts.map(post => {
          if (post.id === data.postId) {
            return {
              ...post,
              interacoes: {
                ...post.interacoes,
                curtidas: data.likes,
                curtidoPor: data.likedBy || post.interacoes.curtidoPor
              }
            };
          }
          return post;
        });
        this.cdr.markForCheck();
      });

    // ===== COMENTÁRIOS EM TEMPO REAL =====
    this.webSocketService.commentUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log('💬 Comentário atualizado via WebSocket:', data);
        this.posts = this.posts.map(post => {
          if (post.id === data.postId) {
            const comments = post.interacoes.comments || [];
            return {
              ...post,
              interacoes: {
                ...post.interacoes,
                comments: data.action === 'delete'
                  ? comments.filter(c => c.id !== data.commentId)
                  : [...comments, data.comment]
              }
            };
          }
          return post;
        });
        this.cdr.markForCheck();
      });

    // ===== USUÁRIOS ONLINE =====
    this.webSocketService.usersOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        console.log('👥 Usuários online:', users);
        this.cdr.markForCheck();
      });

    // ===== NOTIFICAÇÕES =====
    this.webSocketService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification: any) => {
        console.log('🔔 Notificação:', notification);
        this.handleNotification(notification);
        this.cdr.markForCheck();
      });

    // ===== ERROS DO WEBSOCKET =====
    this.webSocketService.errors$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        console.error('❌ Erro WebSocket:', error);
      });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== MAPEAR POST DO WEBSOCKET =====
  private mapPostFromWebSocket(post: any): Post {
    return {
      id: post.id,
      author: post.author,
      createdAt: new Date(post.createdAt),
      content: post.content,
      produto: post.produto,
      interacoes: {
        curtidas: post.interacoes?.curtidas || 0,
        curtidoPor: post.interacoes?.curtidoPor || [],
        compartilhamentos: post.interacoes?.compartilhamentos || 0,
        comments: []
      },
      showComments: false
    };
  }

  // ===== PUBLICAR POST COM WEBSOCKET =====
  publicar(novaPublicacao: any): void {
    console.log('📤 Publicando via WebSocket:', novaPublicacao);
    
    // Emitir via WebSocket para atualização em tempo real
    this.webSocketService.publishPost({
      descricao: novaPublicacao.descricao,
      produto: novaPublicacao.produto
    });

    // Também fazer requisição HTTP como fallback
    this.feedService.addPost(novaPublicacao.descricao, novaPublicacao.produto);
    
    this.fecharModal();
  }

  // ===== CURTIR POST COM WEBSOCKET =====
  curtirPost(postId: string): void {
    console.log('❤️ Curtindo via WebSocket:', postId);
    
    // Emitir via WebSocket
    this.webSocketService.likePost(postId);

    // Também fazer requisição HTTP como fallback
    this.feedService.toggleLike(postId);

    // Atualizar animação localmente
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          interacoes: {
            ...post.interacoes,
            animationState: 'active'
          }
        };
      }
      return post;
    });
    this.cdr.markForCheck();

    // Reset animation state after animation completes
    setTimeout(() => {
      this.posts = this.posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            interacoes: {
              ...post.interacoes,
              animationState: 'inactive'
            }
          };
        }
        return post;
      });
      this.cdr.markForCheck();
    }, 300);
  }

  // ===== COMPARTILHAR POST COM WEBSOCKET =====
  compartilharPost(postId: string): void {
    console.log('🔄 Compartilhando via WebSocket:', postId);
    
    this.webSocketService.sharePost(postId);
    this.feedService.sharePost(postId);
  }

  // ===== ADICIONAR COMENTÁRIO COM WEBSOCKET =====
  addComment(postId: string, commentText: string): void {
    if (!commentText.trim()) return;

    console.log('💬 Adicionando comentário via WebSocket:', commentText);

    // Emitir via WebSocket
    this.webSocketService.addComment(postId, commentText);

    // Também fazer requisição HTTP como fallback
    const newComment: Comment = {
      id: Date.now().toString(),
      authorId: this.currentUser.id,
      authorName: this.currentUser.nome,
      authorAvatar: this.currentUser.avatar,
      text: commentText.trim(),
      createdAt: new Date()
    };

    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        const comments = post.interacoes.comments || [];
        return {
          ...post,
          interacoes: {
            ...post.interacoes,
            comments: [...comments, newComment]
          }
        };
      }
      return post;
    });
    this.cdr.markForCheck();
  }

  // ===== SEGUIR USUÁRIO COM WEBSOCKET =====
  followUser(userId: string): void {
    console.log('👤 Seguindo usuário via WebSocket:', userId);
    this.webSocketService.followUser(userId);
  }

  // ===== TRATAR NOTIFICAÇÕES =====
  private handleNotification(notification: any): void {
    if (notification.type === 'follow') {
      console.log('🎉 Novo seguidor:', notification.user.username);
    } else if (notification.type === 'like') {
      console.log('❤️ Seu post foi curtido');
    } else if (notification.type === 'comment') {
      console.log('💬 Novo comentário no seu post');
    }
    // Aqui você poderia mostrar um toast/snackbar para o usuário
  }

  // ===== OUTRAS FUNÇÕES (MANTER IGUAIS) =====
  
  abrirModal(): void {
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.resetarFormulario();
  }

  resetarFormulario(): void {
    this.novoPost = { texto: '', imagem: undefined };
    this.novoProduto = { nome: '', categoria: '', nota: 5, imagem: undefined };
    this.adicionandoProduto = false;
  }

  toggleProduto(): void {
    this.adicionandoProduto = !this.adicionandoProduto;
    if (!this.adicionandoProduto) {
      this.novoProduto = { nome: '', categoria: '', nota: 5, imagem: undefined };
    }
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }

  // ... (mantém outros métodos) ...
}
