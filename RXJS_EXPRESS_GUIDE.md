# 🚀 RxJS com Express - Guia Prático

## 📦 Instalação

```bash
npm install rxjs express
```

---

## ✅ Exemplo 1: Operador `tap()` para Logging

```typescript
import express from 'express';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const app = express();
app.use(express.json());

// Simular busca de usuário do banco
const getUserFromDB = (userId: number) => {
  return of({ id: userId, name: 'João', email: 'joao@email.com' });
};

app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  getUserFromDB(userId)
    .pipe(
      tap(user => console.log('✅ Usuário encontrado:', user)),
      tap(user => console.log('📤 Enviando resposta:', user)),
      catchError(err => {
        console.error('❌ Erro:', err);
        return throwError(() => err);
      })
    )
    .subscribe({
      next: (user) => res.json(user),
      error: (err) => res.status(500).json({ error: 'Erro ao buscar usuário' })
    });
});

app.listen(3000, () => console.log('Servidor na porta 3000'));
```

---

## ✅ Exemplo 2: Operador `map()` para Transformação

```typescript
import { map } from 'rxjs/operators';

const getPostsFromDB = () => {
  return of([
    { id: 1, title: 'Post 1', likes: 10, views: 100 },
    { id: 2, title: 'Post 2', likes: 20, views: 200 }
  ]);
};

app.get('/api/posts', (req, res) => {
  getPostsFromDB()
    .pipe(
      map(posts => 
        posts.map(post => ({
          ...post,
          engagement: (post.likes / post.views * 100).toFixed(2) + '%'
        }))
      ),
      tap(posts => console.log('📊 Posts processados:', posts))
    )
    .subscribe({
      next: (posts) => res.json(posts),
      error: (err) => res.status(500).json({ error: err.message })
    });
});
```

---

## ✅ Exemplo 3: Operador `filter()` para Validação

```typescript
import { filter } from 'rxjs/operators';

app.post('/api/posts/create', (req, res) => {
  const postData = req.body;

  of(postData)
    .pipe(
      // Validar se caption existe
      filter(data => {
        if (!data.caption) {
          throw new Error('Caption é obrigatório');
        }
        return true;
      }),
      // Validar se rating está entre 1-5
      filter(data => {
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
          throw new Error('Rating deve estar entre 1 e 5');
        }
        return true;
      }),
      tap(data => console.log('✅ Dados validados:', data)),
      // Aqui salvaria no banco de dados
      map(data => ({
        ...data,
        id: Math.random(),
        created_at: new Date()
      }))
    )
    .subscribe({
      next: (newPost) => res.status(201).json(newPost),
      error: (err) => res.status(400).json({ error: err.message })
    });
});
```

---

## ✅ Exemplo 4: Operador `mergeMap()` para Operações Sequenciais

```typescript
import { mergeMap, tap } from 'rxjs/operators';

const getUserFromDB = (userId: number) => {
  return of({ id: userId, name: 'João' });
};

const getPostsByUser = (userId: number) => {
  return of([
    { id: 1, userId, title: 'Post 1' },
    { id: 2, userId, title: 'Post 2' }
  ]);
};

app.get('/api/users/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id);

  of(userId)
    .pipe(
      // Buscar usuário
      mergeMap(id => getUserFromDB(id)),
      tap(user => console.log('👤 Usuário:', user)),
      // Depois buscar posts do usuário
      mergeMap(user => 
        getPostsByUser(user.id).pipe(
          map(posts => ({ user, posts }))
        )
      ),
      tap(data => console.log('📝 Posts encontrados:', data.posts))
    )
    .subscribe({
      next: (data) => res.json(data),
      error: (err) => res.status(500).json({ error: err.message })
    });
});
```

---

## ✅ Exemplo 5: Operador `combineLatest()` para Múltiplas Fontes

```typescript
import { combineLatest } from 'rxjs';

const getUserStats = (userId: number) => {
  return of({ userId, followers: 100, posts: 50 });
};

const getUserAchievements = (userId: number) => {
  return of(['Top Reviewer', 'Helpful', 'Trusted']);
};

app.get('/api/users/:id/profile', (req, res) => {
  const userId = parseInt(req.params.id);

  combineLatest([
    getUserStats(userId),
    getUserAchievements(userId)
  ])
    .pipe(
      map(([stats, achievements]) => ({
        stats,
        achievements
      })),
      tap(profile => console.log('👥 Perfil completo:', profile))
    )
    .subscribe({
      next: (profile) => res.json(profile),
      error: (err) => res.status(500).json({ error: err.message })
    });
});
```

---

## ✅ Exemplo 6: Tratamento de Erros com `catchError()`

```typescript
const fetchFromExternalAPI = (id: number) => {
  // Simular erro ocasional
  if (Math.random() > 0.7) {
    return throwError(() => new Error('API externa indisponível'));
  }
  return of({ data: 'Dados da API' });
};

app.get('/api/external/:id', (req, res) => {
  const id = parseInt(req.params.id);

  of(id)
    .pipe(
      mergeMap(id => fetchFromExternalAPI(id)),
      catchError(err => {
        console.error('❌ Erro na API externa:', err.message);
        // Retornar dados em cache como fallback
        return of({ data: 'Dados em cache' });
      }),
      tap(data => console.log('✅ Dados retornados:', data))
    )
    .subscribe({
      next: (data) => res.json(data),
      error: (err) => res.status(500).json({ error: err.message })
    });
});
```

---

## ✅ Exemplo 7: Serviço com RxJS

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable()
export class UserService {
  private users = [
    { id: 1, name: 'João', email: 'joao@email.com' },
    { id: 2, name: 'Maria', email: 'maria@email.com' }
  ];

  getUserById(id: number) {
    return of(this.users).pipe(
      map(users => users.find(u => u.id === id)),
      tap(user => {
        if (!user) {
          console.warn('⚠️ Usuário não encontrado');
        }
      }),
      catchError(err => {
        console.error('❌ Erro ao buscar usuário:', err);
        return throwError(() => err);
      })
    );
  }

  getAllUsers() {
    return of(this.users).pipe(
      tap(users => console.log(`✅ ${users.length} usuários encontrados`))
    );
  }

  createUser(userData: any) {
    return of(userData).pipe(
      // Validar dados
      tap(data => {
        if (!data.name || !data.email) {
          throw new Error('Nome e email são obrigatórios');
        }
      }),
      // Adicionar ID
      map(data => ({
        ...data,
        id: Math.max(...this.users.map(u => u.id)) + 1,
        created_at: new Date()
      })),
      // Salvar no array
      tap(newUser => {
        this.users.push(newUser);
        console.log('✅ Usuário criado:', newUser);
      })
    );
  }
}

// user.controller.ts
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

---

## ✅ Exemplo 8: Pipeline Completo (Login com RxJS)

```typescript
import { mergeMap, filter, map, catchError, tap } from 'rxjs/operators';

const authenticateUser = (email: string, password: string) => {
  return of({ email, password }).pipe(
    // Validar formato de email
    filter(cred => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cred.email)) {
        throw new Error('Email inválido');
      }
      return true;
    }),
    // Buscar usuário no banco
    mergeMap(cred =>
      of({
        id: 1,
        email: cred.email,
        passwordHash: 'hashed_password_123'
      })
    ),
    // Validar senha
    filter(user => {
      // Aqui você compararia com bcrypt
      if (password !== 'senha123') {
        throw new Error('Senha incorreta');
      }
      return true;
    }),
    // Gerar JWT
    map(user => ({
      user,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600
    })),
    tap(result => console.log('✅ Login bem-sucedido:', result.user.email)),
    catchError(err => {
      console.error('❌ Erro no login:', err.message);
      return throwError(() => new Error('Credenciais inválidas'));
    })
  );
};

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  authenticateUser(email, password).subscribe({
    next: (result) => res.json(result),
    error: (err) => res.status(401).json({ error: err.message })
  });
});
```

---

## 📊 Comparação: Callbacks vs Promises vs RxJS

### ❌ Callbacks (Callback Hell)
```typescript
getUser(id, (err, user) => {
  if (err) throw err;
  getPosts(user.id, (err, posts) => {
    if (err) throw err;
    getComments(posts[0].id, (err, comments) => {
      if (err) throw err;
      res.json({ user, posts, comments });
    });
  });
});
```

### ⚠️ Promises (Melhor)
```typescript
getUser(id)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => res.json(comments))
  .catch(err => res.status(500).json({ error: err }));
```

### ✅ RxJS (Melhor para composição)
```typescript
of(id)
  .pipe(
    mergeMap(id => getUser(id)),
    mergeMap(user => getPosts(user.id)),
    mergeMap(posts => getComments(posts[0].id)),
    catchError(err => throwError(() => err))
  )
  .subscribe({
    next: comments => res.json(comments),
    error: err => res.status(500).json({ error: err })
  });
```

---

## 🎯 Quando Usar RxJS no Backend?

### ✅ Use quando:
- Múltiplas operações assíncronas
- Transformações complexas de dados
- Event-driven architecture
- Real-time data processing
- Precisa de cancelamento (unsubscribe)

### ❌ Não use quando:
- Simples CRUD (use Promises)
- Operação única
- Equipe não conhece RxJS
- Performance crítica (overhead)

---

## 🚀 Melhores Práticas

```typescript
// ✅ BOM: Usar tap para side effects
.pipe(
  tap(data => console.log('Debug:', data)),
  map(data => transform(data))
)

// ❌ RUIM: Lógica no map
.pipe(
  map(data => {
    console.log('Log aqui?');
    return transform(data);
  })
)

// ✅ BOM: Error handling apropriado
.pipe(
  catchError(err => {
    console.error('Erro:', err);
    return of(defaultValue);
  })
)

// ❌ RUIM: Swallow errors
.pipe(
  catchError(() => of(null))
)
```

---

**Resumo:** RxJS no backend oferece composição elegante, mas use com sabedoria! 🎯
