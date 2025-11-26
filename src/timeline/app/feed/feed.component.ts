import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { likeAnimation, publishAnimation, heartBeatAnimation } from '../animations/post.animations';
import { FeedService } from '../services/feed.service';
import { AuthService } from '../../../services/auth.service';
import { FollowService } from '../../../services/follow.service';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: Date;
}

interface Post {
  id: string;
  author: {
    id: string;
    nome: string;
    username: string;
    avatar: string;
  };
  createdAt: Date;
  content: {
    texto: string;
    midia?: string;
  };
  produto?: {
    id: string;
    nome: string;
    categoria: string;
    nota: number;
    imagem?: string;
  };
  interacoes: {
    curtidas: number;
    curtidoPor: string[];
    compartilhamentos: number;
    comments: Comment[];
    animationState?: 'inactive' | 'active';
  };
  showComments?: boolean;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  animations: [likeAnimation, publishAnimation, heartBeatAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  modalAberto = false;
  novoPost = {
    texto: '',
    imagem: undefined as string | undefined
  };

  novoProduto = {
    nome: '',
    categoria: '',
    nota: 5,
    imagem: undefined as string | undefined
  };

  adicionandoProduto = false;

  currentUser = {
    id: '1',
    nome: 'Usuário Atual',
    username: '@usuario',
    avatar: 'assets/user.png'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private feedService: FeedService,
    private authService: AuthService,
    private followService: FollowService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Inscrever-se aos posts do serviço que conecta ao backend
    this.feedService.posts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((posts: any) => {
        // Mapear para o tipo local Post com campos extras para comentários
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
        
        // Diagnóstico: verificar IDs duplicados
        setTimeout(() => this.feedService.diagnosticoDuplicatas(), 500);
      });
  }

  ngOnInit(): void {
    // Obter informações do usuário autenticado do AuthService
    const authenticatedUser = this.authService.getCurrentUser();
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
      console.log('👤 FeedComponent - Usuário carregado:', this.currentUser);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirModal(): void {
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.resetarFormulario();
  }

  resetarFormulario(): void {
    this.novoPost = {
      texto: '',
      imagem: undefined
    };
    this.novoProduto = {
      nome: '',
      categoria: '',
      nota: 5,
      imagem: undefined
    };
    this.adicionandoProduto = false;
  }

  toggleProduto(): void {
    this.adicionandoProduto = !this.adicionandoProduto;
    if (!this.adicionandoProduto) {
      this.novoProduto = {
        nome: '',
        categoria: '',
        nota: 5,
        imagem: undefined
      };
    }
  }

  onImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.novoPost.imagem = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onProdutoImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.novoProduto.imagem = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  publicar(novaPublicacao: { descricao: string; produto?: { nome: string; categoria: string; nota: number; imagem?: string } }): void {
    this.feedService.addPost(novaPublicacao.descricao, novaPublicacao.produto as any);
    this.fecharModal();
  }

  curtirPost(postId: string): void {
    // Log para diagnóstico: registrar qual post foi clicado e os IDs atuais
    console.log('[FeedComponent] curtirPost clicado:', postId);
    console.log('[FeedComponent] IDs atuais do feed:', this.posts.map(p => p.id));

    // Chamar o serviço para curtir
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
    }, 300);
  }

  compartilharPost(postId: string): void {
    // Chamar o serviço para compartilhar
    this.feedService.sharePost(postId);
  }

  deletarPost(postId: string): void {
    // Confirmar antes de deletar
    if (!confirm('Tem certeza que deseja deletar este post?')) {
      return;
    }

    console.log('[FeedComponent] Deletando post:', postId);
    this.feedService.deletePost(postId).subscribe({
      next: () => {
        console.log('[FeedComponent] Post deletado com sucesso');
        // Remover o post da lista local
        this.posts = this.posts.filter(post => post.id !== postId);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[FeedComponent] Erro ao deletar post:', error);
        alert('Erro ao deletar post. Tente novamente.');
      }
    });
  }

  onSeguirClick(userId: string): void {
    const isCurrentlyFollowing = this.followService.isFollowing(userId);
    console.log('[FeedComponent] Toggle seguir usuário:', userId, 'Currently following:', isCurrentlyFollowing);

    if (isCurrentlyFollowing) {
      // Deixar de seguir
      this.followService.unfollowUser(userId).subscribe({
        next: () => {
          console.log('[FeedComponent] Deixou de seguir com sucesso');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('[FeedComponent] Erro ao deixar de seguir:', error);
          alert('Erro ao deixar de seguir. Tente novamente.');
        }
      });
    } else {
      // Seguir
      this.followService.followUser(userId).subscribe({
        next: () => {
          console.log('[FeedComponent] Seguindo com sucesso');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('[FeedComponent] Erro ao seguir:', error);
          alert('Erro ao seguir. Tente novamente.');
        }
      });
    }
  }

  isFollowing(userId: string): boolean {
    return this.followService.isFollowing(userId);
  }
  
  

  formatarTempo(data: Date): string {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    
    if (horas < 1) {
      const minutos = Math.floor(diff / (1000 * 60));
      return `${minutos}m`;
    } else if (horas < 24) {
      return `${horas}h`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias}d`;
    }
  }

  onPublicarClick(event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 300);
  }

  onCompartilharClick(postId: string, event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 300);
    this.compartilharPost(postId);
  }

  // Novo método para adicionar comentário
  addComment(postId: string, commentText: string): void {
    if (!commentText.trim()) return;

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
  }

  // Método para mostrar/ocultar comentários
  toggleComments(postId: string): void {
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          showComments: !post.showComments
        };
      }
      return post;
    });
  }

  // Método para deletar comentário
  deleteComment(postId: string, commentId: string): void {
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        const comments = post.interacoes.comments || [];
        return {
          ...post,
          interacoes: {
            ...post.interacoes,
            comments: comments.filter((comment: Comment) => comment.id !== commentId)
          }
        };
      }
      return post;
    });
  }

  // Método para limpar o formulário de novo comentário
  novoComentario: string = '';
  limparComentario(): void {
    this.novoComentario = '';
  }

  /**
   * Verifica se o usuário atual curtiu o post
   * Normaliza IDs para strings para evitar problemas de comparação
   */
  isPostLikedByCurrentUser(post: Post): boolean {
    const currentUserId = String(this.currentUser.id);
    const likedByUser = post.interacoes.curtidoPor.some(id => String(id) === currentUserId);
    console.log(`[FeedComponent] Verificando like - currentUserId: ${currentUserId}, likedByUser: ${likedByUser}, curtidoPor: [${post.interacoes.curtidoPor.join(', ')}]`);
    return likedByUser;
  }

  // TrackBy para otimizar *ngFor
  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }

  navigarParaPerfil(usuarioId: string): void {
    this.router.navigate(['/perfil'], { queryParams: { id: usuarioId } });
  }
}
