import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { likeAnimation, publishAnimation, heartBeatAnimation } from '../animations/post.animations';

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
    animationState?: 'inactive' | 'active';
  };
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  animations: [likeAnimation, publishAnimation, heartBeatAnimation]
})
export class FeedComponent {
  posts: Post[] = [
    {
      id: '1',
      author: {
        id: '2',
        nome: 'Ana Silva',
        username: '@anaSilva',
        avatar: 'assets/ana.jpg'
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      content: {
        texto: 'Finalmente troquei meu iPhone antigo e que diferença! A câmera é impressionante...'
      },
      produto: {
        id: '1',
        nome: 'iPhone 15 Pro',
        categoria: 'Smartphones',
        nota: 5,
        imagem: 'assets/iphone15pro.jpg'
      },
      interacoes: {
        curtidas: 24,
        curtidoPor: [],
        compartilhamentos: 0
      }
    },
    {
      id: '2',
      author: {
        id: '3',
        nome: 'Carlos Mendes',
        username: '@carlosmnds',
        avatar: 'assets/carlos.jpg'
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      content: {
        texto: 'Recomendo muito essa loja, ótimo atendimento!'
      },
      interacoes: {
        curtidas: 10,
        curtidoPor: [],
        compartilhamentos: 0
      }
    }
  ];
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
    const newPost: Post = {
      id: Date.now().toString(),
      author: this.currentUser,
      createdAt: new Date(),
      content: {
        texto: novaPublicacao.descricao
      },
      produto: novaPublicacao.produto ? {
        id: Date.now().toString(),
        ...novaPublicacao.produto
      } : undefined,
      interacoes: {
        curtidas: 0,
        curtidoPor: [],
        compartilhamentos: 0
      }
    };
    
    this.posts = [newPost, ...this.posts];
    this.fecharModal();
  }

  curtirPost(postId: string): void {
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        const curtido = post.interacoes.curtidoPor.includes(this.currentUser.id);
        return {
          ...post,
          interacoes: {
            ...post.interacoes,
            curtidas: curtido ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
            curtidoPor: curtido 
              ? post.interacoes.curtidoPor.filter(id => id !== this.currentUser.id)
              : [...post.interacoes.curtidoPor, this.currentUser.id],
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
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          interacoes: {
            ...post.interacoes,
            compartilhamentos: post.interacoes.compartilhamentos + 1
          }
        };
      }
      return post;
    });
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
}
