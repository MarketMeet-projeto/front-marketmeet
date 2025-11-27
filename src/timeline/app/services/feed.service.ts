import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Post, User } from '../models/feed.model';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private apiUrl = environment.apiBaseUrl; // Base URL do backend
  
  private currentUser: User = {
    id: '1',
    nome: 'Usuário Atual',
    username: '@usuario',
    avatar: 'assets/user.png'
  };

  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  // Cache e controle de carregamento
  private isLoadingPosts = false;
  private lastLoadTime = 0;
  private readonly CACHE_DURATION = 60000; // 60 segundos de cache

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

  // Carregar posts do backend com cache
  private loadPostsFromBackend(): void {
    const now = Date.now();
    
    // Evitar múltiplas requisições simultâneas e respeitar cache
    if (this.isLoadingPosts || (now - this.lastLoadTime < this.CACHE_DURATION && this.postsSubject.value.length > 0)) {
      console.log('⚡ Usando cache de posts');
      return;
    }

    this.isLoadingPosts = true;
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
        this.lastLoadTime = now;
        this.isLoadingPosts = false;
        console.log('✅ Posts carregados com sucesso:', mappedPosts);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar posts do backend:', error);
        this.loadInitialPosts();
        this.isLoadingPosts = false;
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
    console.log('[FeedService] mapPostFromBackend - Input:', backendPost);
    
    // Aceitar respostas que podem vir aninhadas (ex: { post: { ... } })
    if (backendPost && backendPost.post) {
      console.log('[FeedService] Extraindo backendPost.post da resposta aninhada');
      backendPost = backendPost.post;
    }

    const safeToString = (v: any) => v === null || v === undefined ? '' : String(v);
    
    // LOG: Quais campos de ID estão disponíveis?
    console.group('[FeedService] Campos de ID disponíveis:');
    console.log('id_post:', backendPost.id_post);
    console.log('id:', backendPost.id);
    console.log('post_id:', backendPost.post_id);
    console.groupEnd();
    
    // ID final que será usado
    const finalId = safeToString(backendPost.id_post ?? backendPost.id ?? '');
    console.log('✅ [FeedService] ID FINAL MAPEADO:', finalId);

    // Normalizar a lista de usuários que curtiram para strings
    // O backend retorna likes como array de { id_user: ... } ou apenas [1, 2, 3]
    let likedByCandidates = backendPost.likes || backendPost.liked_by || backendPost.liked_by_ids || backendPost.liked_users || backendPost.liked_user_ids || [];
    
    console.log('[FeedService] likedByCandidates bruto:', likedByCandidates);
    console.log('[FeedService] Tipo de likedByCandidates:', typeof likedByCandidates);
    console.log('[FeedService] É array?', Array.isArray(likedByCandidates));
    
    // Se é um array de objetos com id_user, extrair só os IDs
    if (Array.isArray(likedByCandidates) && likedByCandidates.length > 0 && typeof likedByCandidates[0] === 'object') {
      console.log('[FeedService] Convertendo array de objetos para IDs');
      likedByCandidates = likedByCandidates.map((like: any) => like.id_user || like.id || like);
    }
    
    const curtidoPor = Array.isArray(likedByCandidates)
      ? likedByCandidates.map((id: any) => safeToString(id))
      : [];

    console.log('[FeedService] Likes mapeados para curtidoPor:', curtidoPor);
    console.log('[FeedService] likes_count do backend:', backendPost.likes_count ?? 0);

    return {
      id: finalId,  // Usar o ID já mapeado
      author: {
        id: safeToString(backendPost.id_user ?? backendPost.user_id ?? '0'),
        nome: backendPost.user_name || backendPost.username || 'Usuário',
        username: backendPost.user_username || '@user',
        avatar: backendPost.user_avatar || 'assets/user.png'
      },
      createdAt: new Date(backendPost.created_at || backendPost.createdAt || Date.now()),
      content: {
        texto: backendPost.caption || backendPost.text || '',
        midia: backendPost.product_photo || backendPost.media
      },
      produto: backendPost.category ? {
        id: finalId,  // Usar o mesmo ID do post
        nome: backendPost.product_url || backendPost.product_name || '',
        categoria: backendPost.category || '',
        nota: Number(backendPost.rating ?? 5),
        imagem: backendPost.product_photo || ''
      } : undefined,
      interacoes: {
        curtidas: Number(backendPost.likes_count ?? backendPost.likes?.length ?? 0),
        curtidoPor: curtidoPor,
        compartilhamentos: Number(backendPost.shares_count ?? backendPost.shares ?? 0)
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
    console.group('📝 [FeedService] Criando novo post');
    
    // Verificar token ANTES de fazer qualquer coisa
    const token = this.authService.getToken();
    console.log('🔐 Token disponível?', token ? '✅ ' + token.substring(0, 20) + '...' : '❌ NÃO');
    
    // Atualizar o currentUser com os dados mais recentes do AuthService
    const authenticatedUser = this.authService.getCurrentUser();
    console.log('👥 Usuário autenticado:', authenticatedUser);
    
    if (authenticatedUser) {
      this.currentUser = {
        id: authenticatedUser.id_user?.toString() || authenticatedUser.id?.toString() || '1',
        nome: authenticatedUser.username || 'Usuário',
        username: '@' + (authenticatedUser.username || 'usuario').toLowerCase(),
        avatar: authenticatedUser.avatar || 'assets/user.png'
      };
      console.log('✅ currentUser atualizado:', this.currentUser);
    } else {
      console.warn('⚠️ Usuário não autenticado!');
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

    console.log('📤 Payload a enviar:', postData);
    console.log('🎯 Endpoint:', `${this.apiUrl}/posts/create`);
    console.log('🔍 Token no momento do POST:', this.authService.getToken()?.substring(0, 20) + '...');

    this.http.post<any>(`${this.apiUrl}/posts/create`, postData).subscribe({
      next: (response) => {
        console.log('✅ Sucesso ao criar post:', response);
        
        // A resposta do backend vem como: { success, message, postId, post: {...} }
        // Vamos usar os dados corretos
        const postData = response?.post || response;
        
        // Criar um post bem formatado com os dados do usuário autenticado
        const newPost: Post = {
          id: String(postData.id_post || response.postId || Date.now()),
          author: {
            id: this.currentUser.id,
            nome: this.currentUser.nome,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar
          },
          createdAt: new Date(postData.created_at || new Date()),
          content: {
            texto: postData.caption || content,
            midia: postData.product_photo
          },
          produto: postData.category ? {
            id: String(postData.id_post || response.postId),
            nome: postData.product_url || '',
            categoria: postData.category,
            nota: postData.rating || 5,
            imagem: postData.product_photo || ''
          } : undefined,
          interacoes: {
            curtidas: 0,
            curtidoPor: [],
            compartilhamentos: 0
          }
        };
        
        console.log('📝 Post mapeado para exibição:', newPost);
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
      const response: any = await this.http.post<any>(`${this.apiUrl}/posts/create`, postData).toPromise();
      
      // A resposta do backend vem como: { success, message, postId, post: {...} }
      // Vamos usar os dados corretos
      const postDataFromResponse = response?.post || response;
      
      // Criar um post bem formatado com os dados do usuário autenticado
      const newPost: Post = {
        id: String(postDataFromResponse.id_post || response.postId || Date.now()),
        author: {
          id: this.currentUser.id,
          nome: this.currentUser.nome,
          username: this.currentUser.username,
          avatar: this.currentUser.avatar
        },
        createdAt: new Date(postDataFromResponse.created_at || new Date()),
        content: {
          texto: postDataFromResponse.caption || content,
          midia: postDataFromResponse.product_photo
        },
        produto: postDataFromResponse.category ? {
          id: String(postDataFromResponse.id_post || response.postId),
          nome: postDataFromResponse.product_url || '',
          categoria: postDataFromResponse.category,
          nota: postDataFromResponse.rating || 5,
          imagem: postDataFromResponse.product_photo || ''
        } : undefined,
        interacoes: {
          curtidas: 0,
          curtidoPor: [],
          compartilhamentos: 0
        }
      };
      
      console.log('📝 Post mapeado para exibição:', newPost);
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
    console.log('[FeedService] toggleLike chamado para postId:', postId);

    // Sempre obter o usuário autenticado no momento da ação
    const authenticatedUser = this.authService.getCurrentUser();
    const currentUserId = authenticatedUser?.id_user?.toString() || authenticatedUser?.id?.toString() || this.currentUser.id;
    
    this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}).subscribe({
      next: (response) => {
        console.log('[FeedService] Resposta do like:', response);
        
        const posts = this.postsSubject.value;
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
          const post = posts[postIndex];
          
          // O backend retorna: { success, message, action: 'liked' | 'unliked' }
          // Precisamos atualizar o estado local baseado na ação
          const action = response?.action;
          
          let updatedPost: Post;
          
          if (action === 'liked') {
            // Adicionar like
            updatedPost = {
              ...post,
              interacoes: {
                ...post.interacoes,
                curtidas: post.interacoes.curtidas + 1,
                curtidoPor: [...post.interacoes.curtidoPor, currentUserId]
              }
            };
            console.log('❤️ Post curtido! Novo total:', updatedPost.interacoes.curtidas);
          } else if (action === 'unliked') {
            // Remover like
            updatedPost = {
              ...post,
              interacoes: {
                ...post.interacoes,
                curtidas: Math.max(0, post.interacoes.curtidas - 1),
                curtidoPor: post.interacoes.curtidoPor.filter(id => id !== currentUserId)
              }
            };
            console.log('💔 Like removido! Novo total:', updatedPost.interacoes.curtidas);
          } else {
            // Se não temos a ação, fazer toggle baseado no estado atual
            const userLiked = post.interacoes.curtidoPor.includes(currentUserId);
            updatedPost = {
              ...post,
              interacoes: {
                ...post.interacoes,
                curtidas: userLiked ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
                curtidoPor: userLiked 
                  ? post.interacoes.curtidoPor.filter(id => id !== currentUserId)
                  : [...post.interacoes.curtidoPor, currentUserId]
              }
            };
          }
          
          posts[postIndex] = updatedPost;
          this.postsSubject.next([...posts]);
        } else {
          console.warn('[FeedService] Post não encontrado:', postId);
        }
      },
      error: (error) => {
        console.error('❌ Erro ao curtir post:', error);
        
        // Fallback: fazer toggle local baseado no estado atual
        const posts = this.postsSubject.value;
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const userLiked = post.interacoes.curtidoPor.includes(currentUserId);

        const updatedPost = {
          ...post,
          interacoes: {
            ...post.interacoes,
            curtidas: userLiked ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
            curtidoPor: userLiked 
              ? post.interacoes.curtidoPor.filter((id: string) => id !== currentUserId)
              : [...post.interacoes.curtidoPor, currentUserId]
          }
        };

        posts[postIndex] = updatedPost;
        this.postsSubject.next([...posts]);
      }
    });
  }

  // Curtir post (async/await)
  async toggleLikeAsync(postId: string): Promise<void> {
    // Sempre obter o usuário autenticado no momento da ação
    const authenticatedUser = this.authService.getCurrentUser();
    const currentUserId = authenticatedUser?.id_user?.toString() || authenticatedUser?.id?.toString() || this.currentUser.id;

    try {
      const response = await this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}).toPromise();
      const posts = this.postsSubject.value;
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        const post = posts[postIndex];
        
        // O backend retorna: { success, message, action: 'liked' | 'unliked' }
        const action = response?.action;
        
        let updatedPost: Post;
        
        if (action === 'liked') {
          updatedPost = {
            ...post,
            interacoes: {
              ...post.interacoes,
              curtidas: post.interacoes.curtidas + 1,
              curtidoPor: [...post.interacoes.curtidoPor, currentUserId]
            }
          };
        } else if (action === 'unliked') {
          updatedPost = {
            ...post,
            interacoes: {
              ...post.interacoes,
              curtidas: Math.max(0, post.interacoes.curtidas - 1),
              curtidoPor: post.interacoes.curtidoPor.filter(id => id !== currentUserId)
            }
          };
        } else {
          const userLiked = post.interacoes.curtidoPor.includes(currentUserId);
          updatedPost = {
            ...post,
            interacoes: {
              ...post.interacoes,
              curtidas: userLiked ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
              curtidoPor: userLiked 
                ? post.interacoes.curtidoPor.filter(id => id !== currentUserId)
                : [...post.interacoes.curtidoPor, currentUserId]
            }
          };
        }
        
        posts[postIndex] = updatedPost;
        this.postsSubject.next([...posts]);
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      const posts = this.postsSubject.value;
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) return;

      const post = posts[postIndex];
      const userLiked = post.interacoes.curtidoPor.includes(currentUserId);

      const updatedPost = {
        ...post,
        interacoes: {
          ...post.interacoes,
          curtidas: userLiked ? post.interacoes.curtidas - 1 : post.interacoes.curtidas + 1,
          curtidoPor: userLiked 
            ? post.interacoes.curtidoPor.filter((id: string) => id !== currentUserId)
            : [...post.interacoes.curtidoPor, currentUserId]
        }
      };

      posts[postIndex] = updatedPost;
      this.postsSubject.next([...posts]);
    }
  }

  sharePost(postId: string): void {
    // Sempre obter o usuário autenticado no momento da ação (não usar cache)
    const authenticatedUser = this.authService.getCurrentUser();
    const currentUserId = authenticatedUser?.id_user?.toString() || authenticatedUser?.id?.toString() || this.currentUser.id;

    this.http.post<any>(`${this.apiUrl}/posts/${postId}/share`, {}).subscribe({
      next: (response) => {
        const posts = this.postsSubject.value;
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
          // Extrair o post da resposta (pode vir em response.post)
          const postData = response?.post || response;
          const updatedPost = this.mapPostFromBackend(postData);
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
        // Extrair o post da resposta (pode vir em response.post)
        const postData = response?.post || response;
        const updatedPost = this.mapPostFromBackend(postData);
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

  /**
   * Deletar um post
   * @param postId - ID do post a ser deletado
   * @returns Observable com resposta do servidor
   */
  deletePost(postId: string): Observable<any> {
    console.group('🗑️ [FeedService] Iniciando DELETE de POST');
    console.log('postId recebido:', postId);
    console.log('Tipo de postId:', typeof postId);
    
    return new Observable(observer => {
      const deleteUrl = `${this.apiUrl}/posts/${postId}`;
      console.log('URL final do DELETE:', deleteUrl);
      console.log('Headers enviados:', {
        'Authorization': 'Bearer [token]',
        'Content-Type': 'application/json'
      });
      console.groupEnd();
      
      this.http.delete<any>(deleteUrl).subscribe({
        next: (response) => {
          console.group('✅ [FeedService] Resposta recebida do DELETE');
          console.log('Response:', response);
          console.log('Success?:', response?.success);
          console.log('Message:', response?.message || response?.error);
          console.groupEnd();
          
          // Validar se a resposta indica sucesso
          if (response?.success === false) {
            console.error('[FeedService] Erro na resposta:', response.error || response.message);
            observer.error(response);
            return;
          }
          
          // Remover o post do estado local (BehaviorSubject)
          const currentPosts = this.postsSubject.value;
          const postIndex = currentPosts.findIndex(p => p.id === postId);
          
          if (postIndex !== -1) {
            const updatedPosts = currentPosts.filter(p => p.id !== postId);
            this.postsSubject.next(updatedPosts);
            console.log('[FeedService] Post removido do estado local. Restando:', updatedPosts.length, 'posts');
          } else {
            console.warn('[FeedService] ⚠️ Post não encontrado no estado local:', postId);
          }
          
          console.log('✅ [FeedService] Post deletado com sucesso');
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.group('❌ [FeedService] ERRO ao deletar post');
          console.error('Status HTTP:', error?.status);
          console.error('Mensagem:', error?.message);
          console.error('Resposta completa:', error?.error);
          
          // Log específico para erro 404
          if (error?.status === 404) {
            console.error('⚠️ Erro 404: Post não encontrado');
            console.error('ID enviado:', postId);
            console.error('URL que foi enviada:', deleteUrl);
            console.error('Possível causa: O ID do post pode não corresponder ao campo de ID no banco de dados');
          }
          
          console.groupEnd();
          observer.error(error);
        }
      });
    });
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

  /**
   * Método de diagnóstico para verificar IDs duplicados
   */
  public diagnosticoDuplicatas(): void {
    const posts = this.postsSubject.value;
    console.group('🔍 DIAGNÓSTICO DE DUPLICATAS');
    
    console.log('📊 Total de posts:', posts.length);
    
    // Verificar IDs duplicados nos posts
    const postIds = posts.map(p => p.id);
    const postIdsDuplicadas = postIds.filter((id, index) => postIds.indexOf(id) !== index);
    
    if (postIdsDuplicadas.length > 0) {
      console.warn('⚠️ IDs de posts DUPLICADOS encontrados:', [...new Set(postIdsDuplicadas)]);
    } else {
      console.log('✅ Nenhum ID de post duplicado');
    }
    
    // Listar todos os posts com seus IDs
    console.log('📋 Todos os posts:');
    posts.forEach((post, index) => {
      console.log(`  [${index}] ID: ${post.id} | Autor: ${post.author.nome} | Curtidas: ${post.interacoes.curtidas} | CurtidoPor: [${post.interacoes.curtidoPor.join(', ')}]`);
    });
    
    // Verificar curtidoPor para cada post
    console.log('❤️ Análise de curtidas por post:');
    posts.forEach((post) => {
      const duplicatasCurtidas = post.interacoes.curtidoPor.filter((id, index) => post.interacoes.curtidoPor.indexOf(id) !== index);
      if (duplicatasCurtidas.length > 0) {
        console.warn(`  Post ${post.id}: Usuários DUPLICADOS em curtidoPor:`, [...new Set(duplicatasCurtidas)]);
      } else {
        console.log(`  Post ${post.id}: ✅ Sem duplicatas em curtidoPor`);
      }
    });
    
    console.groupEnd();
  }

  /**
   * Método de teste para simular uma curtida
   */
  public testarCurtida(): void {
    console.group('🧪 TESTE DE CURTIDA');
    
    const posts = this.postsSubject.value;
    if (posts.length === 0) {
      console.warn('Nenhum post disponível para teste');
      console.groupEnd();
      return;
    }

    const postTeste = posts[0];
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = String(currentUser?.id_user || currentUser?.id || '1');

    console.log('📝 Simulando curtida:');
    console.log('  Post ID:', postTeste.id);
    console.log('  Post curtidas antes:', postTeste.interacoes.curtidas);
    console.log('  Post curtidoPor antes:', postTeste.interacoes.curtidoPor);
    console.log('  currentUserId:', currentUserId);
    console.log('  Tipo do currentUserId:', typeof currentUserId);

    // Simular adição de like
    const novosCurtidoPor = [...postTeste.interacoes.curtidoPor, currentUserId];
    console.log('  curtidoPor após adição:', novosCurtidoPor);
    console.log('  Tipos dos IDs:', novosCurtidoPor.map(id => `${id}(${typeof id})`));

    // Verificar se currentUserId está na lista
    const estaNaLista = novosCurtidoPor.includes(currentUserId);
    console.log('  Está na lista:', estaNaLista);

    // Verificar com normalização de string
    const estaComNormalizacao = novosCurtidoPor.some(id => String(id) === currentUserId);
    console.log('  Está na lista (normalizado):', estaComNormalizacao);

    console.groupEnd();
  }
}
