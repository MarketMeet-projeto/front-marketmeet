# 🔌 WebSocket Integration Guide

## Como Usar WebSocket na Aplicação

### 1. **Importar o WebSocketService**

```typescript
import { WebSocketService } from '../../../services/websocket.service';
```

### 2. **Injetar no Componente**

```typescript
constructor(
  private webSocketService: WebSocketService,
  private feedService: FeedService,
  // ... outros serviços
) {}
```

### 3. **Conectar ao WebSocket no ngOnInit**

```typescript
ngOnInit(): void {
  // Conectar ao WebSocket
  this.webSocketService.connect();

  // Escutar novos posts em tempo real
  this.webSocketService.newPost$
    .pipe(takeUntil(this.destroy$))
    .subscribe((post) => {
      console.log('Novo post recebido:', post);
      // Adicionar o novo post ao feed
      this.posts = [post, ...this.posts];
      this.cdr.markForCheck();
    });

  // Escutar atualizações de curtidas
  this.webSocketService.likeUpdate$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      console.log('Curtida atualizada:', data);
      // Atualizar o post com o novo número de curtidas
      this.posts = this.posts.map(p => 
        p.id === data.postId 
          ? { ...p, interacoes: { ...p.interacoes, curtidas: data.likes } }
          : p
      );
      this.cdr.markForCheck();
    });

  // Escutar comentários
  this.webSocketService.commentUpdate$
    .pipe(takeUntil(this.destroy$))
    .subscribe((comment) => {
      console.log('Comentário atualizado:', comment);
      // Adicionar comentário ao post
    });

  // Escutar notificações
  this.webSocketService.notifications$
    .pipe(takeUntil(this.destroy$))
    .subscribe((notification) => {
      console.log('Notificação:', notification);
      // Mostrar notificação para o usuário
    });
}
```

### 4. **Desconectar no ngOnDestroy**

```typescript
ngOnDestroy(): void {
  this.webSocketService.disconnect();
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 5. **Emitir Eventos**

#### Publicar um novo post:
```typescript
publicar(post: any): void {
  this.webSocketService.publishPost(post);
  // O servidor vai emitir para todos os clientes conectados
}
```

#### Curtir um post:
```typescript
curtirPost(postId: string): void {
  this.webSocketService.likePost(postId);
}
```

#### Adicionar comentário:
```typescript
addComment(postId: string, comment: string): void {
  this.webSocketService.addComment(postId, comment);
}
```

#### Seguir um usuário:
```typescript
followUser(userId: string): void {
  this.webSocketService.followUser(userId);
}
```

#### Enviar mensagem privada:
```typescript
sendMessage(userId: string, message: string): void {
  this.webSocketService.sendMessage(userId, message);
}
```

### 6. **Verificar Status de Conexão**

```typescript
if (this.webSocketService.isConnected()) {
  console.log('WebSocket conectado!');
} else {
  console.log('WebSocket desconectado');
}
```

### 7. **Usuários Online**

```typescript
// Verificar se um usuário está online
const isOnline = this.webSocketService.isUserOnline(userId);

// Obter lista de usuários online
const onlineUsers = this.webSocketService.getOnlineUsers();

// Escutar mudanças na lista de online
this.webSocketService.usersOnline$
  .pipe(takeUntil(this.destroy$))
  .subscribe((users) => {
    console.log('Usuários online:', users);
  });
```

### 8. **Atualizar Presença**

```typescript
// Quando o usuário está ativo
this.webSocketService.updatePresence('online');

// Quando o usuário está ausente
this.webSocketService.updatePresence('away');

// Quando o usuário sai
this.webSocketService.updatePresence('offline');
```

## 📡 Eventos do WebSocket

### Cliente → Servidor (Emitir)

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `post:create` | `{ post }` | Criar novo post |
| `post:like` | `{ postId }` | Curtir post |
| `post:unlike` | `{ postId }` | Descurtir post |
| `post:share` | `{ postId }` | Compartilhar post |
| `comment:add` | `{ postId, comment }` | Adicionar comentário |
| `comment:delete` | `{ postId, commentId }` | Deletar comentário |
| `user:follow` | `{ userId }` | Seguir usuário |
| `user:unfollow` | `{ userId }` | Deixar de seguir |
| `user:typing` | `{ postId, isTyping }` | Indicar digitação |
| `message:send` | `{ userId, message }` | Enviar mensagem privada |
| `user:presence` | `{ status }` | Atualizar presença (online/away/offline) |

### Servidor → Cliente (Receber)

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `post:new` | `{ post }` | Novo post publicado |
| `post:liked` | `{ postId, userId, likes }` | Post foi curtido |
| `post:unliked` | `{ postId, userId, likes }` | Post foi descurtido |
| `comment:new` | `{ postId, comment }` | Novo comentário |
| `comment:deleted` | `{ postId, commentId }` | Comentário deletado |
| `user:followed` | `{ user, userId }` | Novo seguidor |
| `users:online` | `[userId1, userId2, ...]` | Lista de usuários online |
| `notification` | `{ type, message, data }` | Notificação geral |
| `connect` | - | Conexão estabelecida |
| `disconnect` | `{ reason }` | Conexão perdida |

## 🔒 Autenticação

O WebSocket usa o mesmo token JWT do seu serviço de autenticação:

```typescript
// O serviço envia automaticamente:
{
  auth: {
    token: this.authService.getToken(),
    userId: user.id_user || user.id
  }
}
```

## 🛡️ Tratamento de Erros

```typescript
this.webSocketService.errors$
  .pipe(takeUntil(this.destroy$))
  .subscribe((error) => {
    console.error('Erro WebSocket:', error);
    // Mostrar mensagem de erro ao usuário
  });
```

## 🚀 Exemplo Completo Integrado no Feed Component

```typescript
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../../../services/websocket.service';
import { FeedService } from '../services/feed.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private webSocketService: WebSocketService,
    private feedService: FeedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Conectar ao WebSocket
    this.webSocketService.connect();

    // Carregar posts iniciais via HTTP
    this.feedService.posts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((posts) => {
        this.posts = posts;
        this.cdr.markForCheck();
      });

    // Escutar novos posts em tempo real
    this.webSocketService.newPost$
      .pipe(takeUntil(this.destroy$))
      .subscribe((post) => {
        this.posts = [post, ...this.posts];
        this.cdr.markForCheck();
      });

    // Escutar atualizações de curtidas em tempo real
    this.webSocketService.likeUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.posts = this.posts.map(p =>
          p.id === data.postId
            ? { ...p, interacoes: { ...p.interacoes, curtidas: data.likes } }
            : p
        );
        this.cdr.markForCheck();
      });
  }

  publicar(post: any): void {
    // Publicar via WebSocket (tempo real)
    this.webSocketService.publishPost(post);
    
    // Também publicar via HTTP (fallback)
    this.feedService.addPost(post.descricao, post.produto);
  }

  curtirPost(postId: string): void {
    this.webSocketService.likePost(postId);
    this.feedService.toggleLike(postId);
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 📊 Benefícios do WebSocket

✅ **Comunicação em Tempo Real**: Atualizações instantâneas  
✅ **Eficiente**: Conexão persistente (não precisa fazer polling)  
✅ **Bidirecional**: Cliente ↔ Servidor  
✅ **Escalável**: Suporta muitos clientes simultâneos  
✅ **Fallback**: Socket.IO suporta polling se WebSocket falhar  

## 🔧 Configuração no Backend (Node.js/Express)

Se você está usando Node.js no backend, precisa instalar Socket.IO:

```bash
npm install socket.io express
```

E configurar assim:

```typescript
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

// Autenticação
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token inválido'));
  // Validar token...
  next();
});

// Evento de conexão
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Quando um novo post é criado
  socket.on('post:create', (post) => {
    // Broadcast para todos os clientes
    io.emit('post:new', post);
  });

  // Quando um post é curtido
  socket.on('post:like', (data) => {
    io.emit('post:liked', data);
  });

  // Quando um usuário sai
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(3000);
```

## 🐛 Debugging

Para ver todos os eventos do WebSocket:

```typescript
// No ngOnInit do seu componente
this.webSocketService.onEvent('*').subscribe((event) => {
  console.log('WebSocket Event:', event);
});
```

Ou no DevTools:

```bash
# No console do navegador
localStorage.debug = 'socket.io-client:*'
```
