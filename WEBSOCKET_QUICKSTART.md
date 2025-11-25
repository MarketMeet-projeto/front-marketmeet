# ⚡ WebSocket - Quick Start (30 segundos)

## 1️⃣ Já Instalado ✅

```
socket.io-client v4.x
@types/socket.io-client
```

## 2️⃣ WebSocketService Criado ✅

📄 `src/services/websocket.service.ts`

## 3️⃣ Use no seu Componente

### Copie e Cole Isto:

```typescript
import { WebSocketService } from '../../../services/websocket.service';
import { takeUntil } from 'rxjs/operators';

export class SeuComponente implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private webSocketService: WebSocketService,
    // ... outros serviços
  ) {}

  ngOnInit(): void {
    // ✅ CONECTAR
    this.webSocketService.connect();

    // ✅ ESCUTAR NOVOS POSTS
    this.webSocketService.newPost$
      .pipe(takeUntil(this.destroy$))
      .subscribe(post => {
        this.posts = [post, ...this.posts];
        console.log('📝 Novo post:', post);
      });

    // ✅ ESCUTAR CURTIDAS
    this.webSocketService.likeUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('❤️ Curtida:', data);
      });

    // ✅ ESCUTAR COMENTÁRIOS
    this.webSocketService.commentUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(comment => {
        console.log('💬 Comentário:', comment);
      });
  }

  // ✅ PUBLICAR POST
  publicarPost(texto: string) {
    this.webSocketService.publishPost({ descricao: texto });
  }

  // ✅ CURTIR POST
  curtirPost(postId: string) {
    this.webSocketService.likePost(postId);
  }

  // ✅ COMENTAR
  comentarPost(postId: string, texto: string) {
    this.webSocketService.addComment(postId, texto);
  }

  // ✅ DESCONECTAR
  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 4️⃣ Pronto! 🎉

Seu componente agora recebe eventos em **TEMPO REAL**!

---

## 📚 Documentação Completa

- **`WEBSOCKET_README.md`** - Visão geral e arquitetura
- **`WEBSOCKET_INTEGRATION.md`** - Guia de integração detalhado
- **`WEBSOCKET_BACKEND_CONFIG.md`** - Configurar backend Node.js
- **`WEBSOCKET_TESTING.md`** - Como testar localmente

---

## 🚀 Próximos Passos

1. ✅ Copie o código acima para seu componente
2. ✅ Teste no navegador (F12 → Console)
3. ✅ Configure o backend se ainda não tem
4. ✅ Leia `WEBSOCKET_INTEGRATION.md` para mais detalhes

---

## ❓ Dúvidas Rápidas

**P: Funciona sem backend?**  
R: Não, você precisa de um servidor com Socket.IO

**P: Como configuro o backend?**  
R: Veja `WEBSOCKET_BACKEND_CONFIG.md`

**P: Posso usar só HTTP?**  
R: Sim, mas vai perder a velocidade tempo real. WebSocket é 10x mais rápido.

**P: Funciona no mobile?**  
R: Sim! Socket.IO cuida disso automaticamente.

---

## 🎯 Eventos Disponíveis

### Enviar (Emit)

```typescript
// Posts
this.ws.publishPost(post)        // 📝 Novo post
this.ws.likePost(postId)         // ❤️ Curtir
this.ws.unlikePost(postId)       // 🤍 Descurtir
this.ws.sharePost(postId)        // 🔄 Compartilhar

// Comentários
this.ws.addComment(postId, text) // 💬 Comentar
this.ws.deleteComment(postId, id) // 🗑️ Deletar

// Usuários
this.ws.followUser(userId)       // 👤 Seguir
this.ws.unfollowUser(userId)     // 👤 Deixar seguir
this.ws.sendMessage(userId, msg) // 💌 Mensagem privada

// Status
this.ws.updatePresence('online') // 📍 Presença
this.ws.setTyping(postId, true)  // ✏️ Digitando
```

### Receber (Subscribe)

```typescript
this.ws.newPost$              // 📝 Novo post
this.ws.likeUpdate$           // ❤️ Curtida atualizada
this.ws.commentUpdate$        // 💬 Comentário
this.ws.usersOnline$          // 👥 Usuários online
this.ws.notifications$        // 🔔 Notificações
this.ws.connectionStatus$     // 🔌 Status de conexão
this.ws.errors$               // ❌ Erros
```

---

## ✅ Checklist

- [ ] WebSocket service importado
- [ ] WebSocket conectado em ngOnInit
- [ ] Eventos escutando em tempo real
- [ ] WebSocket desconectado em ngOnDestroy
- [ ] Testado no navegador (F12)
- [ ] Backend rodando (http://localhost:3000)

**Tudo feito? Parabéns! 🎉 Seu app agora tem TEMPO REAL!**
