# 🔐 Autenticação JWT - Frontend

## 📋 Resumo da Implementação

Este documento explica como a autenticação JWT foi implementada no frontend Angular.

---

## 🏗️ Arquitetura da Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Login Component                                           │
│     └─> AuthService.login(email, password)                   │
│         └─> POST /api/users/login                            │
│                                                               │
│  2. AuthService                                              │
│     └─> Salva token em localStorage                          │
│     └─> Salva dados do usuário em localStorage               │
│     └─> BehaviorSubject para reatividade                     │
│                                                               │
│  3. AuthInterceptor (HTTP Interceptor)                       │
│     └─> Lê token do localStorage                             │
│     └─> Adiciona "Authorization: Bearer <token>" em cada     │
│        requisição HTTP                                       │
│     └─> Se 401 → logout e redireciona para /login            │
│                                                               │
│  4. AuthGuard (Route Guard)                                  │
│     └─> Verifica se usuário está autenticado                 │
│     └─> Se não → redireciona para /login                     │
│                                                               │
│  5. FeedService                                              │
│     └─> Usa ID do usuário autenticado para criar posts       │
│     └─> Todas as requisições levam o token (via interceptor) │
│                                                               │
└─────────────────────────────────────────────────────────────┘
        ↓ (com token JWT no header Authorization)
        ↓
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. POST /api/users/login                                    │
│     └─> Valida credenciais                                   │
│     └─> Gera token JWT                                       │
│     └─> Retorna { token, user }                              │
│                                                               │
│  2. Middleware de JWT                                        │
│     └─> Verifica se "Authorization: Bearer <token>" existe   │
│     └─> Decodifica e valida o token                          │
│     └─> Se inválido → 401                                    │
│     └─> Se expirado → 401                                    │
│                                                               │
│  3. Rotas Protegidas                                         │
│     └─> POST /api/posts/create                               │
│     └─> POST /api/posts/{id}/like                            │
│     └─> GET /api/posts/timeline                              │
│     └─> (Todas precisam do token válido)                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivos Criados/Modificados

### 1. `src/login/app/services/auth.service.ts` ✅ MODIFICADO
**Responsabilidades:**
- `login(email, password)` - Faz login e salva token
- `logout()` - Remove token e dados do usuário
- `getToken()` - Retorna o token JWT
- `isAuthenticated()` - Verifica se autenticado
- `getCurrentUser()` - Retorna dados do usuário atual
- `getCurrentUserId()` - Retorna ID do usuário atual

**LocalStorage:**
```javascript
localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIs...')
localStorage.setItem('current_user', '{"id":1,"username":"joao",...}')
```

---

### 2. `src/app/interceptors/auth.interceptor.ts` ✅ NOVO
**O que faz:**
1. Lê o token do localStorage
2. Adiciona no header de TODAS as requisições HTTP:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
3. Se receber 401 → faz logout e redireciona para /login
4. Se receber 403 → mostra erro de permissão

**Exemplo de requisição modificada:**
```typescript
// Antes (sem token):
this.http.post('/api/posts/create', postData)

// Depois (com interceptor):
// Header automáticamente adicionado:
// Authorization: Bearer <token>
this.http.post('/api/posts/create', postData)
```

---

### 3. `src/app/guards/auth.guard.ts` ✅ NOVO
**O que faz:**
- Verifica se `authService.isAuthenticated()` é true
- Se true → permite acessar a rota
- Se false → redireciona para /login com returnUrl

**Uso nas rotas:**
```typescript
{
  path: 'timeline',
  component: TimelineComponent,
  canActivate: [AuthGuard]  // ← Protege esta rota
}
```

---

### 4. `src/app/app.config.ts` ✅ MODIFICADO
**Registra o AuthInterceptor:**
```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

---

### 5. `src/app.routes.ts` ✅ MODIFICADO
**Proteção de rotas:**
```typescript
{
  path: 'timeline',
  loadComponent: TimelineComponent,
  canActivate: [AuthGuard]  // ← Protege
}
```

---

### 6. `src/timeline/app/services/feed.service.ts` ✅ MODIFICADO
**Usa usuário autenticado:**
```typescript
constructor(
  private http: HttpClient,
  private authService: AuthService
) {
  const authenticatedUser = this.authService.getCurrentUser();
  if (authenticatedUser) {
    this.currentUser = authenticatedUser;
  }
}
```

---

## 🔄 Fluxo Completo de Login

### 1️⃣ Usuário clica "Entrar"
```typescript
// login/app/app.component.ts
onSubmit() {
  this.authService.login(email, password).subscribe(...)
}
```

### 2️⃣ AuthService faz POST para backend
```typescript
// login/app/services/auth.service.ts
login(email: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
    tap((response: any) => {
      // Salva token
      localStorage.setItem('auth_token', response.token)
      // Salva usuário
      localStorage.setItem('current_user', JSON.stringify(response.user))
    })
  )
}
```

### 3️⃣ Backend valida e retorna token JWT
```json
// Resposta do backend
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "joao",
    "email": "joao@example.com"
  }
}
```

### 4️⃣ Frontend navega para timeline
```typescript
this.router.navigate(['/timeline'])
```

### 5️⃣ AuthGuard verifica autenticação
```typescript
// app/guards/auth.guard.ts
canActivate(): boolean {
  if (this.authService.isAuthenticated()) {
    return true  // Acesso permitido
  }
  this.router.navigate(['/login'])
  return false  // Bloqueado
}
```

### 6️⃣ FeedComponent carrega posts COM token
```typescript
// Interceptor adiciona automaticamente:
// Authorization: Bearer <token>
this.http.get('/api/posts/timeline')
```

### 7️⃣ Backend verifica token no middleware
```
POST /api/posts/create
Header: Authorization: Bearer <token>
↓
Middleware JWT verifica token
↓
Se válido → Executa ação (cria post)
Se inválido/expirado → 401 Unauthorized
```

### 8️⃣ Se token expirado (401)
```typescript
// AuthInterceptor detecta 401
catchError((error: HttpErrorResponse) => {
  if (error.status === 401) {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
})
```

---

## 🧪 Como Testar

### No Console do Navegador (F12)
```javascript
// 1. Ver o token salvo
const token = localStorage.getItem('auth_token')
console.log(token)

// 2. Ver dados do usuário
const user = JSON.parse(localStorage.getItem('current_user'))
console.log(user)

// 3. Fazer requisição com token manualmente
fetch('http://10.51.47.41:3000/api/posts/timeline', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log(data))
```

### No Network Inspector (F12)
1. Abra **Network**
2. Faça login
3. Procure por requisições para `/api/posts/...`
4. Clique em qualquer uma
5. Vá em **Headers**
6. Procure por `Authorization: Bearer ...`

---

## 🚨 Mensagens de Debug

Quando você fizer login ou usar rotas protegidas, verá no console:

```
✅ Resposta do login: {...}
🔐 Token JWT salvo em localStorage
👤 Usuário salvo: {id: 1, username: "joao", ...}
✅ Login realizado com sucesso!
🔐 Token salvo: eyJhbGciOiJIUzI1NiIs...
👤 Usando usuário autenticado: {id: 1, nome: "João", ...}
🔐 Token JWT adicionado ao header Authorization
✅ Usuário autenticado, acesso permitido
```

---

## ⚠️ Erros Comuns

### ❌ "401 Unauthorized"
**Causa:** Token inválido ou expirado
**Solução:** Fazer login novamente

### ❌ "403 Forbidden"
**Causa:** Token válido, mas sem permissão para essa ação
**Solução:** Verificar permissões no backend

### ❌ Redireciona para /login mesmo autenticado
**Causa:** Token não está em localStorage
**Solução:** Verificar se o backend está retornando o token no login

### ❌ "Cannot read property 'id' of null"
**Causa:** Usuário não está em localStorage
**Solução:** Fazer logout e login novamente

---

## 🔒 Segurança

### ✅ O que está protegido:
- Token não é visível na URL (está em localStorage)
- Token é enviado apenas para o backend (header Authorization)
- Rotas /timeline e /perfil* só são acessíveis com token válido
- Se token expirar, usuário é automaticamente deslogado

### ⚠️ Pontos de Atenção:
- localStorage é vulnerável a XSS (se houver injeção de código malicioso)
- SessionStorage seria mais seguro mas é perdido ao fechar o navegador
- Em produção, usar HTTPS para proteger o token em trânsito
- Backend deve validar token em TODAS as rotas protegidas

---

## 📞 Resumo de Mudanças

| Arquivo | Tipo | O Quê |
|---------|------|-------|
| `auth.service.ts` | Modificado | Salvar/carregar token e usuário |
| `auth.interceptor.ts` | Novo | Adicionar token em requisições |
| `auth.guard.ts` | Novo | Proteger rotas |
| `app.config.ts` | Modificado | Registrar interceptor |
| `app.routes.ts` | Modificado | Adicionar guard nas rotas |
| `feed.service.ts` | Modificado | Usar usuário autenticado |
| `login/app.component.ts` | Modificado | Melhorar logs |

---

## ✅ Checklist

- [x] AuthService salva token em localStorage
- [x] AuthInterceptor adiciona token em todas as requisições
- [x] AuthGuard protege rotas de timeline e perfil
- [x] Se 401 → logout automático
- [x] FeedService usa usuário autenticado
- [x] Logs de debug para facilitar troubleshooting
- [x] Documentação completa

---

**Pronto para usar!** 🚀
