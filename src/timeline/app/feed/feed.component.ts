import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { likeAnimation, publishAnimation, heartBeatAnimation } from '../animations/post.animations';
import { FeedService } from '../services/feed.service';

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
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  animations: [likeAnimation, publishAnimation, heartBeatAnimation]
})
export class FeedComponent {
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

  constructor(private feedService: FeedService) {
    // Inscrever-se aos posts do serviço que conecta ao backend
    this.feedService.posts$.subscribe((posts: any) => {
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
    });
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
}
