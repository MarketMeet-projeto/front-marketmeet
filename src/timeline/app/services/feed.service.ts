import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Post, User } from '../models/feed.model';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private apiUrl = 'http://localhost:3000/api'; // Base URL do backend
  
  private currentUser: User = {
    id: '1',
    nome: 'Usuário Atual',
    username: '@usuario',
    avatar: 'assets/user.png'
  };

  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Usar o usuário autenticado
    const authenticatedUser = this.authService.getCurrentUser();
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
      console.log('👤 FeedService - Usando usuário autenticado:', this.currentUser);
    }

    // Carregar posts do backend ao iniciar
    this.loadPostsFromBackend();
  }

  // Carregar posts do backend
  private loadPostsFromBackend(): void {
    const timelineUrl = `${this.apiUrl}/posts/timeline`;
    console.log(`Carregando posts de: ${timelineUrl}`);

    this.http.get<any>(timelineUrl).subscribe({
      next: (response) => {
        console.log('🛰️ Resposta do backend:', response);

        // Garante que o valor seja um array
        const posts = Array.isArray(response)
          ? response
          : response?.posts || response?.data || [];

        const mappedPosts = posts.map((post: any) => this.mapPostFromBackend(post));
        this.postsSubject.next(mappedPosts);
        console.log('✅ Posts carregados com sucesso:', mappedPosts);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar posts do backend:', error);
        this.loadInitialPosts();
      }
    });
  }

  // Carregar posts do backend (async/await)
  async loadPostsFromBackendAsync(): Promise<void> {
    const timelineUrl = `${this.apiUrl}/posts/timeline`;
    console.log(`Carregando posts de: ${timelineUrl}`);

    try {
      const response = await this.http.get<any>(timelineUrl).toPromise();
      console.log('🛰️ Resposta do backend:', response);

      // Garante que o valor seja um array
      const posts = Array.isArray(response)
        ? response
        : response?.posts || response?.data || [];

      const mappedPosts = posts.map((post: any) => this.mapPostFromBackend(post));
      this.postsSubject.next(mappedPosts);
      console.log('✅ Posts carregados com sucesso:', mappedPosts);
    } catch (error) {
      console.error('❌ Erro ao carregar posts do backend:', error);
      this.loadInitialPosts();
    }
  }

  // Mapear dados do backend para o modelo local
  private mapPostFromBackend(backendPost: any): Post {
    return {
      id: backendPost.id_post?.toString() || backendPost.id || '',
      author: {
        id: backendPost.id_user?.toString() || '0',
        nome: backendPost.user_name || backendPost.username || 'Usuário',
        username: backendPost.user_username || '@user',
        avatar: backendPost.user_avatar || 'assets/user.png'
      },
      createdAt: new Date(backendPost.created_at),
      content: {
        texto: backendPost.caption || '',
        midia: backendPost.product_photo
      },
      produto: backendPost.category ? {
        id: backendPost.id_post?.toString() || '',
        nome: backendPost.product_url || '',
        categoria: backendPost.category || '',
        nota: backendPost.rating || 5,
        imagem: backendPost.product_photo || ''
      } : undefined,
      interacoes: {
        curtidas: backendPost.likes_count || 0,
        curtidoPor: [],
        compartilhamentos: backendPost.shares_count || 0
      }
    };
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

    this.postsSubject.next(initialPosts);
  }

  addPost(content: string, produto?: { nome: string; categoria: string; nota: number; imagem: string }): void {
<<<<<<< HEAD
    console.group('📝 [FeedService] Criando novo post');
    
    // Verificar token ANTES de fazer qualquer coisa
    const token = this.authService.getToken();
    console.log('🔐 Token disponível?', token ? '✅ ' + token.substring(0, 20) + '...' : '❌ NÃO');
    
    // Atualizar o currentUser com os dados mais recentes do AuthService
    const authenticatedUser = this.authService.getCurrentUser();
    console.log('👥 Usuário autenticado:', authenticatedUser);
    
=======
    // Atualizar o currentUser com os dados mais recentes do AuthService
    const authenticatedUser = this.authService.getCurrentUser();
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
<<<<<<< HEAD
      console.log('✅ currentUser atualizado:', this.currentUser);
    } else {
      console.warn('⚠️ Usuário não autenticado!');
=======
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79
    }

    // Construir objeto com apenas campos que têm valor
    const postData: any = {
      caption: content
    };

    // Adicionar campos opcionais apenas se existirem
    if (produto) {
      if (produto.nota !== undefined && produto.nota !== null) postData.rating = produto.nota;
      if (produto.categoria) postData.category = produto.categoria;
      if (produto.imagem) postData.product_photo = produto.imagem;
      if (produto.nome) postData.product_url = produto.nome;
    }

<<<<<<< HEAD
    console.log('📤 Payload a enviar:', postData);
    console.log('🎯 Endpoint:', `${this.apiUrl}/posts/create`);
=======
    console.log('📤 Enviando post com dados:', postData);
    console.log('🔍 Token no momento do POST:', this.authService.getToken()?.substring(0, 20) + '...');
>>>>>>> e730141bbc6ca3f57dc444b7eb43e503745aaf79

    this.http.post<any>(`${this.apiUrl}/posts/create`, postData).subscribe({
      next: (response) => {
        console.log('✅ Sucesso ao criar post:', response);
        const newPost = this.mapPostFromBackend(response);
        this.postsSubject.next([newPost, ...this.postsSubject.value]);
        console.log('✅ Post adicionado ao feed');
        console.groupEnd();
      },
      error: (error) => {
        console.error('❌ Erro ao criar post:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        console.error('Resposta:', error.error);
        
        // Fallback: adicionar post localmente mesmo com erro
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
        console.groupEnd();
      }
    });
  }

  // Criar post (async/await)
  async addPostAsync(content: string, produto?: { nome: string; categoria: string; nota: number; imagem: string }): Promise<void> {
    // Atualizar o currentUser com os dados mais recentes do AuthService
    const authenticatedUser = this.authService.getCurrentUser();
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
    }

    // Construir objeto com apenas campos que têm valor
    const postData: any = {
      id_user: parseInt(this.currentUser.id, 10),  // Converter para number
      caption: content
    };

    // Adicionar campos opcionais apenas se existirem
    if (produto) {
      if (produto.nota !== undefined && produto.nota !== null) postData.rating = produto.nota;
      if (produto.categoria) postData.category = produto.categoria;
      if (produto.imagem) postData.product_photo = produto.imagem;
      if (produto.nome) postData.product_url = produto.nome;
    }

    console.log('📤 Enviando post com dados:', postData);

    try {
      const response = await this.http.post<any>(`${this.apiUrl}/posts/create`, postData).toPromise();
      const newPost = this.mapPostFromBackend(response!);
      this.postsSubject.next([newPost, ...this.postsSubject.value]);
      console.log('✅ Post criado com sucesso:', response);
    } catch (error) {
      console.error('❌ Erro ao criar post:', error);
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
  }

  toggleLike(postId: string): void {
    this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}).subscribe({
      next: (response) => {
        const posts = this.postsSubject.value;
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
          const updatedPost = this.mapPostFromBackend(response);
          posts[postIndex] = updatedPost;
          this.postsSubject.next([...posts]);
        }
      },
      error: (error) => {
        console.error('Erro ao curtir post:', error);
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
              ? post.interacoes.curtidoPor.filter((id: string) => id !== this.currentUser.id)
              : [...post.interacoes.curtidoPor, this.currentUser.id]
          }
        };

        posts[postIndex] = updatedPost;
        this.postsSubject.next([...posts]);
      }
    });
  }

  // Curtir post (async/await)
  async toggleLikeAsync(postId: string): Promise<void> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}).toPromise();
      const posts = this.postsSubject.value;
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        const updatedPost = this.mapPostFromBackend(response!);
        posts[postIndex] = updatedPost;
        this.postsSubject.next([...posts]);
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
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
            ? post.interacoes.curtidoPor.filter((id: string) => id !== this.currentUser.id)
            : [...post.interacoes.curtidoPor, this.currentUser.id]
        }
      };

      posts[postIndex] = updatedPost;
      this.postsSubject.next([...posts]);
    }
  }

  sharePost(postId: string): void {
    this.http.post<any>(`${this.apiUrl}/posts/${postId}/share`, {}).subscribe({
      next: (response) => {
        const posts = this.postsSubject.value;
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
          const updatedPost = this.mapPostFromBackend(response);
          posts[postIndex] = updatedPost;
          this.postsSubject.next([...posts]);
        }
      },
      error: (error) => {
        console.error('Erro ao compartilhar post:', error);
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
    });
  }

  // Compartilhar post (async/await)
  async sharePostAsync(postId: string): Promise<void> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/posts/${postId}/share`, {}).toPromise();
      const posts = this.postsSubject.value;
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        const updatedPost = this.mapPostFromBackend(response!);
        posts[postIndex] = updatedPost;
        this.postsSubject.next([...posts]);
      }
    } catch (error) {
      console.error('Erro ao compartilhar post:', error);
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
  }

  getPostById(id: string): Observable<Post | undefined> {
    return this.posts$.pipe(
      map(posts => posts.find(p => p.id === id))
    );
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  // Método auxiliar para testar rotas do backend
  testBackendRoute(customUrl: string): void {
    console.log(`Testando rota customizada: ${customUrl}`);
    this.http.get<any>(customUrl).subscribe({
      next: (response) => {
        const posts = Array.isArray(response)
          ? response
          : response?.posts || response?.data || [];

        const mappedPosts = posts.map((post: any) => this.mapPostFromBackend(post));
        this.postsSubject.next(mappedPosts);
        console.log(`✅ Sucesso! Posts carregados de: ${customUrl}`, mappedPosts);
      },
      error: (error) => {
        console.error(`❌ Erro ao carregar de ${customUrl}:`, error);
      }
    });
  }
}
