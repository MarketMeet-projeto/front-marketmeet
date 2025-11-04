import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Post, User } from '../models/feed.model';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private currentUser: User = {
    id: '1',
    nome: 'Usuário Atual',
    username: '@usuario',
    avatar: 'assets/user.png'
  };

  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  constructor() {
    // Inicializar com dados de exemplo
    this.loadInitialPosts();
  }

  private loadInitialPosts(): void {
    const initialPosts: Post[] = [
      {
        id: '1',
        author: {
          id: '2',
          nome: 'Ana Silva',
          username: '@anaSilva',
          avatar: 'assets/ana.jpg'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
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
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
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

    this.postsSubject.next(initialPosts);
  }

  addPost(content: string, produto?: { nome: string; categoria: string; nota: number; imagem: string }): void {
    const newPost: Post = {
      id: Date.now().toString(),
      author: this.currentUser,
      createdAt: new Date(),
      content: {
        texto: content
      },
      produto: produto ? {
        id: Date.now().toString(),
        ...produto
      } : undefined,
      interacoes: {
        curtidas: 0,
        curtidoPor: [],
        compartilhamentos: 0
      }
    };

    this.postsSubject.next([newPost, ...this.postsSubject.value]);
  }

  toggleLike(postId: string): void {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const userLiked = post.interacoes.curtidoPor.includes(this.currentUser.id);

    const updatedPost = {
      ...post,
      interacoes: {
        ...post.interacoes,
        curtidas: userLiked ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
        curtidoPor: userLiked 
          ? post.interacoes.curtidoPor.filter(id => id !== this.currentUser.id)
          : [...post.interacoes.curtidoPor, this.currentUser.id]
      }
    };

    posts[postIndex] = updatedPost;
    this.postsSubject.next([...posts]);
  }

  sharePost(postId: string): void {
    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const updatedPost = {
      ...post,
      interacoes: {
        ...post.interacoes,
        compartilhamentos: post.interacoes.compartilhamentos + 1
      }
    };

    posts[postIndex] = updatedPost;
    this.postsSubject.next([...posts]);
  }

  getPostById(id: string): Observable<Post | undefined> {
    return this.posts$.pipe(
      map(posts => posts.find(p => p.id === id))
    );
  }

  getCurrentUser(): User {
    return this.currentUser;
  }
}