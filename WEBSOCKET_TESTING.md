# 🧪 Como Testar WebSocket Localmente

## Setup Local

### 1. Backend - Crie um arquivo `server-websocket.ts`

```typescript
// server-websocket.ts
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Usuários conectados
const users = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Armazenar usuário
  const userId = socket.handshake.auth.userId || socket.id;
  users.set(userId, socket.id);

  // Broadcast: usuários online
  io.emit('users:online', Array.from(users.keys()));

  // Novo post
  socket.on('post:create', (post) => {
    console.log('📝 Novo post:', post);
    socket.broadcast.emit('post:new', {
      id: Date.now().toString(),
      ...post,
      createdAt: new Date()
    });
  });

  // Curtir
  socket.on('post:like', (data) => {
    console.log('❤️ Curtida:', data);
    io.emit('post:liked', data);
  });

  // Comentário
  socket.on('comment:add', (data) => {
    console.log('💬 Comentário:', data);
    io.emit('comment:new', {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
    users.delete(userId);
    io.emit('users:online', Array.from(users.keys()));
  });
});

server.listen(3000, () => {
  console.log('🚀 WebSocket server rodando em http://localhost:3000');
});
```

### 2. Execute o Backend

```bash
# Terminal 1
npx ts-node server-websocket.ts
```

### 3. Frontend Rodando

```bash
# Terminal 2
npm start
```

Agora você tem:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## Testes Manuais

### Teste 1: Verificar Conexão

```javascript
// No console do navegador
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Conectado!', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado');
});
```

### Teste 2: Emitir Novo Post

```javascript
socket.emit('post:create', {
  descricao: 'Olá, teste de post!',
  produto: null
});

socket.on('post:new', (post) => {
  console.log('📝 Post recebido:', post);
});
```

### Teste 3: Emitir Curtida

```javascript
socket.emit('post:like', {
  postId: '123',
  userId: 'user-123'
});

socket.on('post:liked', (data) => {
  console.log('❤️ Curtida:', data);
});
```

### Teste 4: Múltiplas Abas

1. Abra `http://localhost:4200` em 2 abas
2. Na aba 1, emita um post:
```javascript
socket.emit('post:create', {
  descricao: 'Teste entre abas'
});
```
3. Verifique se na aba 2 aparece "post:new" 🎉

## Teste de Carga

### Simular 100 Conexões Simultâneas

```javascript
// Console do navegador (⚠️ Use com cuidado!)
for (let i = 0; i < 10; i++) {
  const s = io('http://localhost:3000');
  s.on('connect', () => {
    console.log(`Cliente ${i} conectado`);
  });
}
```

Verifique no backend quantas conexões você tem 🚀

## Teste de Latência

```javascript
const startTime = Date.now();

socket.emit('test:ping', { time: startTime });

socket.on('test:pong', (data) => {
  const latency = Date.now() - data.time;
  console.log(`⏱️ Latência: ${latency}ms`);
});
```

## Monitorar Eventos

### Chrome DevTools - Network

1. Abra DevTools (F12)
2. Vá em Network
3. Filtre por "ws" (WebSocket)
4. Veja os frames enviados/recebidos

### Extensão Socket.IO DevTools

1. Instale: [Socket.IO DevTools](https://chrome.google.com/webstore/detail/socketio-devtools/jccgghfhfbdjhlpgaaifaofdfielpfeb)
2. Abra DevTools → Socket.IO
3. Veja eventos em tempo real 📊

## Teste com Jest (Unitário)

```typescript
// websocket.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService, { provide: AuthService, useValue: { getToken: () => 'test-token' } }]
    });
    service = TestBed.inject(WebSocketService);
    authService = TestBed.inject(AuthService);
  });

  it('deve conectar ao WebSocket', () => {
    service.connect();
    expect(service.isConnected()).toBeTruthy();
  });

  it('deve emitir eventos', () => {
    service.connect();
    const spy = spyOn(console, 'log');
    service.emitEvent('test:event', { data: 'teste' });
    expect(spy).toHaveBeenCalled();
  });

  it('deve desconectar', () => {
    service.connect();
    service.disconnect();
    expect(service.isConnected()).toBeFalsy();
  });
});
```

## Teste E2E com Cypress

```typescript
// feed.cy.ts
describe('WebSocket Feed Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/timeline');
  });

  it('deve conectar ao WebSocket', () => {
    cy.window().then((win) => {
      const socket = win.webSocketService;
      expect(socket.isConnected()).to.equal(true);
    });
  });

  it('deve publicar post em tempo real', () => {
    // Publicar post
    cy.get('.nova-publicacao-btn').click();
    cy.get('textarea').type('Teste E2E');
    cy.get('.publicar-btn').click();

    // Verificar que apareceu
    cy.get('.post').should('contain', 'Teste E2E');
  });

  it('deve atualizar curtidas em tempo real', () => {
    cy.get('.like-button').first().click();
    cy.get('.like-count').first().should('contain', '1');
  });
});
```

## Teste de Desempenho

### Medir Latência

```javascript
const latencies = [];

function measureLatency() {
  const start = performance.now();
  
  socket.emit('post:like', { postId: '123' });
  
  socket.once('post:liked', () => {
    const latency = performance.now() - start;
    latencies.push(latency);
    console.log(`Latência: ${latency.toFixed(2)}ms`);
  });
}

// Medir 10 vezes
for (let i = 0; i < 10; i++) {
  setTimeout(measureLatency, i * 1000);
}

// Resultado
setTimeout(() => {
  const avg = latencies.reduce((a, b) => a + b) / latencies.length;
  console.log(`Latência média: ${avg.toFixed(2)}ms`);
}, 15000);
```

### Medir Throughput

```javascript
const startTime = Date.now();
let messageCount = 0;

socket.on('post:liked', () => {
  messageCount++;
});

// Enviar 100 eventos
for (let i = 0; i < 100; i++) {
  socket.emit('post:like', { postId: `post-${i}` });
}

// Contar após 5 segundos
setTimeout(() => {
  const elapsed = (Date.now() - startTime) / 1000;
  const throughput = messageCount / elapsed;
  console.log(`Throughput: ${throughput.toFixed(2)} eventos/segundo`);
}, 5000);
```

## Checklist de Testes

- [ ] Conexão estabelecida com sucesso
- [ ] Eventos são emitidos corretamente
- [ ] Broadcast funciona (múltiplos clientes)
- [ ] Reconexão automática funciona
- [ ] Fallback para polling (se WebSocket falhar)
- [ ] Autenticação valida token
- [ ] Usuários online/offline corretos
- [ ] Sem memory leaks
- [ ] Latência < 100ms
- [ ] Funcionamento em mobile

## Troubleshooting

### Erro: "WebSocket connection failed"

✅ Verifique se backend está rodando:
```bash
curl http://localhost:3000/api/health
```

### Erro: "401 Unauthorized"

✅ Verifique o token JWT:
```javascript
console.log(authService.getToken());
```

### Evento não chega

✅ Verifique se está escutando:
```javascript
socket.on('post:new', (data) => {
  console.log('Recebi:', data);
});
```

### Desconecta frequentemente

✅ Verifique logs do servidor por "disconnect"

## Relatório de Teste

Crie um documento com os resultados:

```markdown
# Teste WebSocket - Data: 2024-11-24

## Resultados

✅ Conexão: OK (142ms)
✅ Latência média: 45ms
✅ Throughput: 1200 eventos/s
✅ Reconexão: OK (3s)
✅ Memory: Estável (sem leaks)
✅ Mobile: Funcionando

## Observações

- Latência um pouco alta em conexão 4G
- Reconexão automática funcionando bem
- Sem crashes detectados

## Aprovado para produção ✅
```

---

Agora você pode testar tudo localmente! 🧪✅
