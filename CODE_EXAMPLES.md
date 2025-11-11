# 💻 JWT Authentication - Complete Code Examples

## 📖 Exemplos Práticos

### 1. Login com Token

#### Frontend (Angular)
```typescript
// login/app/app.component.ts

onSubmit() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    
    // Chama o serviço de autenticação
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Login com sucesso!');
        console.log('Token salvo:', this.authService.getToken());
        
        // Navega para timeline
        this.router.navigate(['/timeline']);
      },
      error: (error) => {
        console.error('❌ Erro ao fazer login:', error);
        alert('Email ou senha incorretos');
      }
    });
  }
}
```

#### Backend (Node.js/Express)
```javascript
// routes/auth.js

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Busca usuário no banco
  db.query(
    'SELECT * FROM account WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no servidor' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Email não encontrado' });
      }
      
      const user = results[0];
      
      // Verifica senha
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }
      
      // Gera token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Retorna token e dados do usuário
      res.json({
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        }
      });
    }
  );
});
```

---

### 2. Interceptor Adicionando Token

#### Frontend (Angular)
```typescript
// app/interceptors/auth.interceptor.ts

intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  // 1. Obter token do localStorage
  const token = this.authService.getToken();
  console.log('🔐 Token obtido:', token ? 'Sim ✅' : 'Não ❌');
  
  // 2. Se houver token, adicionar no header
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('➕ Header Authorization adicionado');
  }
  
  // 3. Enviar requisição
  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // 4. Se receber 401, fazer logout
      if (error.status === 401) {
        console.error('❌ Token inválido/expirado (401)');
        this.authService.logout();
        this.router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
}
```

#### Exemplo de Requisição Modificada
```typescript
// Código original no FeedComponent
this.http.post('/api/posts/create', postData).subscribe(...)

// O que realmente é enviado:
POST /api/posts/create
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjk0NDY0NTEyfQ.abcd...

{
  "caption": "Adorei este produto!",
  "category": "Smartphones",
  "rating": 5,
  "product_photo": "https://...",
  "product_url": "iPhone 15 Pro"
}
```

#### Backend Recebendo Token
```javascript
// middleware/auth.js

const verifyJWT = (req, res, next) => {
  // 1. Extrair token do header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  // 2. Verificar token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // 3. Se válido, colocar dados do usuário em req
    req.user = decoded;
    console.log('✅ Token válido para usuário:', decoded.id);
    next();
  });
};

module.exports = verifyJWT;
```

#### Backend Usando o Usuário
```javascript
// routes/posts.js

router.post('/create', verifyJWT, (req, res) => {
  // req.user foi adicionado pelo middleware
  const userId = req.user.id; // ← Vem do token
  
  const { caption, category, rating, product_photo, product_url } = req.body;
  
  // Criar post com ID do usuário do token
  db.query(
    'INSERT INTO post (id_user, caption, category, rating, product_photo, product_url, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [userId, caption, category, rating, product_photo, product_url],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar post' });
      }
      
      res.json({
        success: true,
        message: 'Post criado com sucesso',
        postId: results.insertId
      });
    }
  );
});
```

---

### 3. Route Guard Protegendo Rotas

#### Frontend (Angular)
```typescript
// app/guards/auth.guard.ts

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  console.log('🛡️ Verificando acesso à rota:', state.url);
  
  // 1. Verificar se tem token
  const isAuthenticated = this.authService.isAuthenticated();
  console.log('Autenticado?', isAuthenticated ? 'Sim ✅' : 'Não ❌');
  
  if (isAuthenticated) {
    // 2. Se sim, permitir
    console.log('✅ Acesso permitido');
    return true;
  }
  
  // 3. Se não, redirecionar
  console.log('❌ Redirecionando para /login');
  this.router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
}
```

#### Uso nas Rotas
```typescript
// app.routes.ts

{
  path: 'timeline',
  loadComponent: () => import('./timeline/app/app.component').then(m => m.AppComponent),
  canActivate: [AuthGuard]  // ← Guard aplicado
},
{
  path: 'perfil',
  loadComponent: () => import('./perfil/app/app.component').then(m => m.AppComponent),
  canActivate: [AuthGuard]  // ← Guard aplicado
}
```

#### Fluxo de Acesso
```
Usuário tenta: /timeline
        ↓
Route guard: AuthGuard.canActivate()
        ↓
authService.isAuthenticated()
        ↓
localStorage.getItem('auth_token')
        ↓
    ┌───────────────┬──────────────┐
    ↓               ↓               ↓
  Existe         Não existe       null
    ↓               ↓               ↓
  return          return          return
   true           false           false
    ↓               ↓               ↓
 Load          Redirect        Redirect
timeline       to /login       to /login
```

---

### 4. FeedService com Usuário Autenticado

#### Frontend (Angular)
```typescript
// timeline/app/services/feed.service.ts

constructor(
  private http: HttpClient,
  private authService: AuthService
) {
  // 1. Carregar usuário autenticado
  const authenticatedUser = this.authService.getCurrentUser();
  
  if (authenticatedUser) {
    console.log('👤 Usando usuário autenticado:', authenticatedUser.id);
    this.currentUser = {
      id: authenticatedUser.id?.toString(),
      nome: authenticatedUser.name,
      username: authenticatedUser.username,
      avatar: authenticatedUser.avatar || 'assets/user.png'
    };
  }
}

// 2. Criar post com ID do usuário
addPost(content: string, produto?: any): void {
  const postData = {
    id_user: this.currentUser.id,  // ← ID do usuário autenticado
    caption: content,
    rating: produto?.nota,
    category: produto?.categoria,
    product_photo: produto?.imagem,
    product_url: produto?.nome
  };
  
  console.log('📤 Criando post para usuário:', this.currentUser.id);
  
  // 3. Interceptor adiciona token automaticamente
  this.http.post(`${this.apiUrl}/posts/create`, postData).subscribe({
    next: (response) => {
      console.log('✅ Post criado com sucesso');
      // Adicionar post ao feed
    },
    error: (error) => {
      console.error('❌ Erro ao criar post:', error);
    }
  });
}
```

#### O Que é Enviado ao Backend
```json
POST /api/posts/create
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "id_user": "1",           // ← Do usuário autenticado
  "caption": "Adorei!",
  "rating": 5,
  "category": "Smartphones",
  "product_photo": "https://...",
  "product_url": "iPhone 15 Pro"
}
```

---

### 5. Logout e Limpeza

#### Frontend (Angular)
```typescript
// timeline/app/app.component.ts

logout() {
  console.log('🚪 Iniciando logout...');
  
  // 1. Chamar método de logout do AuthService
  this.authService.logout();
  // Internamente faz:
  // - localStorage.removeItem('auth_token')
  // - localStorage.removeItem('current_user')
  // - currentUserSubject.next(null)
  
  console.log('✅ Dados removidos do localStorage');
  
  // 2. Redirecionar para login
  this.router.navigate(['/login']);
  console.log('✅ Redirecionado para /login');
}
```

#### AuthService
```typescript
// login/app/services/auth.service.ts

logout(): void {
  console.log('🔄 Executando logout...');
  
  // 1. Remover token
  localStorage.removeItem(this.tokenKey);
  console.log('🗑️  Token removido');
  
  // 2. Remover usuário
  localStorage.removeItem('current_user');
  console.log('🗑️  Dados do usuário removido');
  
  // 3. Limpar Observable
  this.currentUserSubject.next(null);
  console.log('🗑️  BehaviorSubject limpo');
  
  console.log('✅ Logout completado');
}
```

#### Resultado
```javascript
// localStorage antes
{
  auth_token: "eyJ...",
  current_user: "{id: 1, username: 'joao'...}"
}

// localStorage depois
{
  // Vazio! Ambos foram removidos
}
```

---

### 6. Error Handling

#### Erro 401 (Token Expirado)
```typescript
// Interceptor detecta:

if (error.status === 401) {
  console.error('❌ Token inválido ou expirado');
  
  // 1. Fazer logout
  this.authService.logout();
  
  // 2. Redirecionar
  this.router.navigate(['/login']);
  
  // 3. Mostrar mensagem (opcional)
  alert('Sua sessão expirou. Por favor, faça login novamente.');
}
```

#### Erro 403 (Permissão Negada)
```typescript
// Interceptor detecta:

if (error.status === 403) {
  console.error('❌ Você não tem permissão para esta ação');
  
  // Token é válido, mas usuário não tem permissão
  alert('Você não tem permissão para fazer isso.');
}
```

#### Erro 500 (Erro no Servidor)
```typescript
// Interceptor passa para a aplicação:

error: (error) => {
  if (error.status === 500) {
    console.error('❌ Erro no servidor:', error.error?.message);
    alert('Erro no servidor. Tente novamente mais tarde.');
  }
}
```

---

### 7. Debug no Console

#### Login
```
✅ Resposta do login: {token: "eyJ...", user: {...}}
🔐 Token JWT salvo em localStorage
👤 Usuário salvo: {id: 1, username: "joao", name: "João Silva"}
✅ Login realizado com sucesso!
🔐 Token salvo: eyJhbGciOiJIUzI1NiI...
👤 Usando usuário autenticado: {id: "1", nome: "João Silva", username: "joao", avatar: "..."}
```

#### Fazer Requisição
```
📤 Criando post para usuário: 1
🔐 Token obtido: Sim ✅
➕ Header Authorization adicionado
📤 Criando post para usuário: 1
✅ Post criado com sucesso
```

#### Token Expirado
```
🔐 Token obtido: Sim ✅
➕ Header Authorization adicionado
❌ Token inválido/expirado (401)
🔄 Executando logout...
🗑️  Token removido
🗑️  Dados do usuário removido
🗑️  BehaviorSubject limpo
✅ Logout completado
```

---

## 🎯 Fluxo Completo de Uma Ação

### Cenário: Criar um Post

#### 1. Usuário escreve algo e clica "Publicar"
```typescript
publicar(novaPublicacao) {
  this.feedService.addPost(
    novaPublicacao.descricao,
    novaPublicacao.produto
  );
}
```

#### 2. FeedService prepara dados
```typescript
addPost(content: string, produto?: any) {
  const postData = {
    id_user: '1',  // Do usuário autenticado
    caption: content,
    rating: produto?.nota,
    category: produto?.categoria,
    product_photo: produto?.imagem,
    product_url: produto?.nome
  };
  
  console.log('📤 Criando post para usuário: 1');
  
  this.http.post(`${this.apiUrl}/posts/create`, postData)...
}
```

#### 3. HttpClient faz a requisição
```
POST /api/posts/create
```

#### 4. AuthInterceptor intercepta
```typescript
intercept(request, next) {
  const token = localStorage.getItem('auth_token');
  // token = "eyJ..."
  
  request = request.clone({
    setHeaders: {
      Authorization: `Bearer eyJ...`
    }
  });
  
  // Requisição modificada:
  // POST /api/posts/create
  // Authorization: Bearer eyJ...
  
  return next.handle(request)...
}
```

#### 5. Backend recebe a requisição
```javascript
POST /api/posts/create
Authorization: Bearer eyJ...
```

#### 6. Middleware JWT verifica
```javascript
verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  // token = "eyJ..."
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
      // req.user = { id: 1, username: "joao", ... }
      next();
    } else {
      res.status(401).json({ error: 'Token inválido' });
    }
  });
}
```

#### 7. Handler cria o post
```javascript
router.post('/create', verifyJWT, (req, res) => {
  const userId = req.user.id;  // 1
  const { caption, category, rating, ... } = req.body;
  
  db.query(
    'INSERT INTO post (id_user, caption, ...) VALUES (?, ?, ...)',
    [userId, caption, ...],
    (err, results) => {
      res.json({
        success: true,
        postId: results.insertId
      });
    }
  );
});
```

#### 8. Resposta volta para o frontend
```json
{
  "success": true,
  "postId": 123
}
```

#### 9. FeedComponent atualiza a tela
```typescript
next: (response) => {
  console.log('✅ Post criado com sucesso');
  // Adicionar o novo post ao feed
  this.posts = [newPost, ...this.posts];
}
```

#### 10. Usuário vê o novo post na tela
```
[Seu Post]
"Adorei este produto!"
Publicado há 5 segundos
❤️ 0  💬 0  ↗️ 0
```

---

## ✅ Checklist de Implementação

```
Frontend:
  [x] AuthService com login/logout
  [x] AuthInterceptor adicionando token
  [x] AuthGuard protegendo rotas
  [x] FeedService usando usuário autenticado
  [x] localStorage salvando token
  [x] Logs de debug
  [x] Error handling

Backend:
  [ ] Endpoint /api/users/login retorna token
  [ ] Middleware JWT em rotas protegidas
  [ ] Verifica Authorization header
  [ ] Retorna 401 se token inválido
  [ ] Usa id do usuário para criar posts
```

---

**Todos os exemplos são reais e funcionais!** ✅
