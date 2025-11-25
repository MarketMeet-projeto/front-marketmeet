# 🔧 Configuração Backend com WebSocket (Node.js + Express + Socket.IO)

Se você estiver usando Node.js/Express no backend, aqui está como configurar WebSocket.

## 1. Instalação

```bash
npm install socket.io cors express
```

## 2. Configuração Básica do Servidor

```typescript
// server.ts ou main.ts
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ===== AUTENTICAÇÃO WEBSOCKET =====
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token) {
      return next(new Error('Token não fornecido'));
    }

    // Validar JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.data.userId = userId;
    socket.data.user = decoded;
    next();
  } catch (error: any) {
    next(new Error(`Erro de autenticação: ${error.message}`));
  }
});

// ===== GERENCIAR CONEXÕES =====
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`✅ Usuário ${userId} conectado: ${socket.id}`);
  
  connectedUsers.set(userId, socket.id);

  // Notificar que o usuário está online
  io.emit('user:online', { userId, socketId: socket.id });
  io.emit('users:online', Array.from(connectedUsers.keys()));

  // ===== NOVOS POSTS =====
  socket.on('post:create', (post) => {
    console.log('📝 Novo post de:', userId);
    
    // Broadcast para todos os clientes (exceto o emissor)
    socket.broadcast.emit('post:new', {
      ...post,
      id: Date.now().toString(),
      author: {
        id: userId,
        username: socket.data.user.username
      },
      createdAt: new Date(),
      interacoes: {
        curtidas: 0,
        curtidoPor: [],
        compartilhamentos: 0
      }
    });
  });

  // ===== CURTIR POST =====
  socket.on('post:like', (data) => {
    console.log('❤️ Post curtido por:', userId);
    
    // Broadcast para todos os clientes
    io.emit('post:liked', {
      postId: data.postId,
      userId: userId,
      likes: data.likes || 1
    });
  });

  // ===== DESCURTIR POST =====
  socket.on('post:unlike', (data) => {
    console.log('🤍 Post descurtido por:', userId);
    
    io.emit('post:unliked', {
      postId: data.postId,
      userId: userId,
      likes: data.likes || 0
    });
  });

  // ===== COMENTÁRIOS =====
  socket.on('comment:add', (data) => {
    console.log('💬 Novo comentário de:', userId);
    
    const comment = {
      id: Date.now().toString(),
      postId: data.postId,
      authorId: userId,
      authorName: socket.data.user.username,
      text: data.comment,
      createdAt: new Date()
    };

    // Broadcast para todos os clientes
    io.emit('comment:new', comment);
  });

  socket.on('comment:delete', (data) => {
    console.log('🗑️ Comentário deletado por:', userId);
    
    io.emit('comment:deleted', {
      postId: data.postId,
      commentId: data.commentId,
      userId: userId
    });
  });

  // ===== COMPARTILHAMENTO =====
  socket.on('post:share', (data) => {
    console.log('🔄 Post compartilhado por:', userId);
    
    io.emit('post:shared', {
      postId: data.postId,
      userId: userId,
      timestamp: new Date()
    });
  });

  // ===== SEGUINDO USUÁRIOS =====
  socket.on('user:follow', (data) => {
    const targetUserId = data.userId;
    console.log(`👤 ${userId} está seguindo ${targetUserId}`);

    // Notificar o usuário sendo seguido
    const targetSocketId = connectedUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('user:followed', {
        userId: userId,
        username: socket.data.user.username
      });
    }

    // Notificar todos os clientes
    io.emit('user:follow:updated', {
      follower: userId,
      following: targetUserId
    });
  });

  socket.on('user:unfollow', (data) => {
    const targetUserId = data.userId;
    console.log(`👤 ${userId} deixou de seguir ${targetUserId}`);
    
    io.emit('user:unfollow:updated', {
      follower: userId,
      following: targetUserId
    });
  });

  // ===== MENSAGENS PRIVADAS =====
  socket.on('message:send', (data) => {
    const targetUserId = data.userId;
    const message = {
      from: userId,
      to: targetUserId,
      text: data.message,
      timestamp: new Date()
    };

    console.log(`💌 Mensagem de ${userId} para ${targetUserId}`);

    // Enviar para o usuário destinatário
    const targetSocketId = connectedUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('message:received', message);
    }
  });

  // ===== DIGITAÇÃO (TYPING) =====
  socket.on('user:typing', (data) => {
    console.log(`✏️ ${userId} está digitando no post ${data.postId}`);
    
    socket.broadcast.emit('user:typing', {
      userId: userId,
      postId: data.postId,
      isTyping: data.isTyping
    });
  });

  // ===== PRESENÇA (ONLINE/AWAY/OFFLINE) =====
  socket.on('user:presence', (data) => {
    console.log(`📍 ${userId} está ${data.status}`);
    
    io.emit('user:presence:updated', {
      userId: userId,
      status: data.status
    });
  });

  // ===== DESCONEXÃO =====
  socket.on('disconnect', () => {
    console.log(`❌ Usuário ${userId} desconectado`);
    connectedUsers.delete(userId);
    
    // Notificar que o usuário saiu
    io.emit('user:offline', { userId });
    io.emit('users:online', Array.from(connectedUsers.keys()));
  });

  // ===== TRATAMENTO DE ERROS =====
  socket.on_error = (error) => {
    console.error('❌ Erro no socket:', error);
  };
});

// ===== ROTAS HTTP =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', connectedUsers: connectedUsers.size });
});

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔌 WebSocket pronto para conexões`);
});

export { app, io, server };
```

## 3. Usar com Banco de Dados (Exemplo com MongoDB)

```typescript
import mongoose from 'mongoose';

// ===== SCHEMAS =====
const postSchema = new mongoose.Schema({
  authorId: String,
  caption: String,
  createdAt: { type: Date, default: Date.now },
  likes: [String], // Array de IDs de usuários que curtiram
  shares: Number,
  comments: [{
    id: String,
    authorId: String,
    text: String,
    createdAt: Date
  }]
});

const Post = mongoose.model('Post', postSchema);

// ===== WEBSOCKET COM BANCO DE DADOS =====

socket.on('post:create', async (post) => {
  try {
    // Salvar no banco de dados
    const newPost = await Post.create({
      authorId: userId,
      caption: post.descricao,
      likes: [],
      shares: 0,
      comments: []
    });

    // Broadcast para todos
    io.emit('post:new', {
      id: newPost._id.toString(),
      author: { id: userId, username: socket.data.user.username },
      content: { texto: post.descricao },
      createdAt: newPost.createdAt,
      interacoes: {
        curtidas: 0,
        compartilhamentos: 0
      }
    });
  } catch (error) {
    socket.emit('error', { message: 'Erro ao criar post' });
  }
});

socket.on('post:like', async (data) => {
  try {
    // Encontrar post no banco
    const post = await Post.findById(data.postId);
    
    if (!post) {
      return socket.emit('error', { message: 'Post não encontrado' });
    }

    // Adicionar like
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    // Broadcast atualização
    io.emit('post:liked', {
      postId: data.postId,
      userId: userId,
      likes: post.likes.length
    });
  } catch (error) {
    socket.emit('error', { message: 'Erro ao curtir post' });
  }
});

socket.on('comment:add', async (data) => {
  try {
    const post = await Post.findById(data.postId);
    
    if (!post) {
      return socket.emit('error', { message: 'Post não encontrado' });
    }

    const comment = {
      id: Date.now().toString(),
      authorId: userId,
      text: data.comment,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    io.emit('comment:new', {
      ...comment,
      postId: data.postId
    });
  } catch (error) {
    socket.emit('error', { message: 'Erro ao adicionar comentário' });
  }
});
```

## 4. Escalando com Redis Adapter (Para múltiplos servidores)

Se você tiver múltiplas instâncias do servidor, use Redis para sincronizar eventos:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## 5. Monitorar Conexões

```typescript
// Middlewares para logging
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  console.log(`Total connections: ${io.engine.clientsCount}`);
});

// Endpoint para status
app.get('/api/websocket/status', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    totalSockets: io.engine.clientsCount,
    users: Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
      userId,
      socketId
    }))
  });
});
```

## 6. Testes com Socket.IO Client

```typescript
// Teste no console do navegador
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'seu-token-jwt',
    userId: '123'
  }
});

socket.on('connect', () => {
  console.log('✅ Conectado!');
});

// Testar emissão
socket.emit('post:create', {
  descricao: 'Teste de post',
  produto: null
});

socket.on('post:new', (post) => {
  console.log('Novo post:', post);
});
```

## 7. Best Practices

✅ **Sempre validar token** no middleware de autenticação  
✅ **Usar namespaces** para diferentes tipos de eventos  
✅ **Implementar heartbeat** para detectar conexões mortas  
✅ **Usar Redis adapter** para escalabilidade  
✅ **Comprimir mensagens** para tráfego reduzido  
✅ **Usar rooms** para notificações específicas  
✅ **Implementar reconnection** no cliente  
✅ **Logar eventos** para debugging  

## 8. Usando Namespaces (Avançado)

```typescript
// Namespace para notificações
const notificationsNamespace = io.of('/notifications');

notificationsNamespace.on('connection', (socket) => {
  socket.on('notification:subscribe', (userId) => {
    socket.join(`user:${userId}`);
  });
});

// Enviar notificação para usuário específico
notificationsNamespace.to(`user:${userId}`).emit('notification', data);
```

## 9. Rooms para Broadcasts Eficientes

```typescript
// Entrar em uma room
socket.join(`post:${postId}`);

// Emitir apenas para pessoas na room
io.to(`post:${postId}`).emit('comment:new', comment);

// Sair da room
socket.leave(`post:${postId}`);
```

Agora seu backend está pronto para WebSocket! 🚀
