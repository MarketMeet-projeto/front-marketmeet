# ✅ Autenticação JWT - Implementação Concluída

## 🎯 O que foi implementado

Implementei um **sistema completo de autenticação JWT** no seu frontend Angular. Agora:

✅ Usuário faz login
✅ Backend gera um token JWT
✅ Token é salvo em localStorage
✅ Token é automaticamente adicionado em TODAS as requisições HTTP
✅ Rotas protegidas verificam autenticação
✅ Se token expirar, usuário é automaticamente deslogado

---

## 📦 Arquivos Modificados/Criados

### ✅ Novo: `src/app/interceptors/auth.interceptor.ts`
**O que faz:** Adiciona o token JWT no header `Authorization` de TODAS as requisições

```typescript
// Exemplo: Uma requisição que era assim:
POST /api/posts/create

// Agora automaticamente fica assim:
POST /api/posts/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### ✅ Novo: `src/app/guards/auth.guard.ts`
**O que faz:** Protege rotas que precisam de autenticação

```typescript
// Se usuário não estiver autenticado:
// /timeline → redirecionado para /login
// /perfil → redirecionado para /login
```

---

### ✅ Modificado: `src/login/app/services/auth.service.ts`
**Mudanças:**
- Agora salva o token JWT em localStorage
- Agora salva os dados do usuário em localStorage
- Novo método: `getToken()` - retorna o token
- Novo método: `isAuthenticated()` - verifica se autenticado
- Novo método: `logout()` - remove token e dados
- Novo método: `getCurrentUser()` - retorna dados do usuário
- Novo método: `getCurrentUserId()` - retorna ID do usuário

```typescript
// Fluxo do login:
1. authService.login(email, password)
   ↓
2. Faz POST para /api/users/login
   ↓
3. Backend retorna { token, user }
   ↓
4. AuthService salva em localStorage:
   - localStorage.setItem('auth_token', token)
   - localStorage.setItem('current_user', JSON.stringify(user))
   ↓
5. Usuário pode usar o app
```

---

### ✅ Modificado: `src/app/app.config.ts`
**Mudanças:**
- Registrou o AuthInterceptor como provider HTTP

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

---

### ✅ Modificado: `src/app.routes.ts`
**Mudanças:**
- Adicionou `canActivate: [AuthGuard]` nas rotas protegidas

```typescript
{
  path: 'timeline',
  loadComponent: TimelineComponent,
  canActivate: [AuthGuard]  // ← Protegida
}
```

---

### ✅ Modificado: `src/timeline/app/services/feed.service.ts`
**Mudanças:**
- Agora injeta AuthService
- Agora usa o usuário autenticado para criar posts
- Todos os posts agora usam o ID do usuário correto

```typescript
constructor(
  private http: HttpClient,
  private authService: AuthService  // ← Novo
) {
  const authenticatedUser = this.authService.getCurrentUser();
  if (authenticatedUser) {
    this.currentUser = authenticatedUser;
  }
}
```

---

### ✅ Modificado: `src/login/app/app.component.ts`
**Mudanças:**
- Melhorados os logs de login
- Melhor tratamento de erros

---

### ✅ Modificado: `src/timeline/app/app.component.ts`
**Mudanças:**
- Novo método `logout()` que chama `authService.logout()`
- Remove token
- Remove dados do usuário
- Redireciona para /login

```typescript
async logout() {
  this.authService.logout()  // ← Remove token
  await this.router.navigate(['/login'])
}
```

---

### 📚 Nova Documentação: `JWT_AUTH.md`
Guia completo com:
- Arquitetura da autenticação
- Fluxo completo de login
- Como testar
- Mensagens de debug
- Troubleshooting
- Segurança

---

## 🔄 Fluxo Completo Agora

```
1. Usuário clica "Entrar"
   ↓
2. LoginComponent → AuthService.login(email, password)
   ↓
3. HttpClient POST /api/users/login
   ↓
4. AuthInterceptor adiciona: Authorization: Bearer <token>
   ↓
5. Backend valida credenciais
   ↓
6. Backend retorna { token: "eyJ...", user: {...} }
   ↓
7. AuthService salva em localStorage:
   - auth_token
   - current_user
   ↓
8. LoginComponent navega para /timeline
   ↓
9. AuthGuard verifica: authService.isAuthenticated()
   ↓
10. Se true → Permite acesso
    Se false → Redireciona para /login
    ↓
11. TimelineComponent carrega
    ↓
12. FeedComponent carrega posts
    ↓
13. Interceptor adiciona token automaticamente:
    GET /api/posts/timeline
    Authorization: Bearer <token>
    ↓
14. Backend verifica token
    ↓
15. Backend retorna posts (se token válido)
```

---

## 🧪 Como Testar

### 1️⃣ Abra o Console (F12)
Vá em **Console** e faça login

### 2️⃣ Você verá estes logs:
```
✅ Resposta do login: {token: "...", user: {...}}
🔐 Token JWT salvo em localStorage
👤 Usuário salvo: {id: 1, username: "joao", ...}
✅ Login realizado com sucesso!
🔐 Token salvo: eyJhbGciOiJIUzI1NiIs...
👤 Usando usuário autenticado: {id: 1, ...}
```

### 3️⃣ Verifique o localStorage
```javascript
// No console, digite:
localStorage.getItem('auth_token')
// Você verá algo como:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Abra o Network Inspector (F12)
1. Clique em **Network**
2. Faça login
3. Procure por requisições para `/api/posts/...`
4. Clique em uma delas
5. Vá em **Headers** → **Request Headers**
6. Você verá: `Authorization: Bearer eyJ...`

### 5️⃣ Teste um logout
- Clique no botão de logout
- Tente acessar /timeline diretamente (será redirecionado para /login)

---

## 🔒 Segurança

### ✅ Protegido:
- Token não fica visível na URL
- Token é enviado apenas no header (não em query params)
- Rotas protegidas não são acessíveis sem token
- Se token expirar (401), usuário é deslogado automaticamente

### ⚠️ Importante para o Backend:
1. **TODAS as rotas protegidas** devem ter um middleware JWT que verifica:
   ```javascript
   // Exemplo de middleware no Express:
   app.post('/api/posts/create', verifyJWT, (req, res) => {
     // Se chegou aqui, token é válido
     // req.user contém os dados do usuário
   })
   ```

2. **O backend deve retornar 401** se o token for inválido/expirado
   ```javascript
   if (!validToken) {
     res.status(401).json({ error: 'Token inválido' })
   }
   ```

---

## 📋 Checklist de Funcionalidades

- [x] Login salva token em localStorage
- [x] HTTP Interceptor adiciona token em requisições
- [x] Route Guard protege rotas
- [x] 401 faz logout automático
- [x] Logout limpa token e dados
- [x] FeedService usa usuário autenticado
- [x] Logs de debug para troubleshooting
- [x] Documentação completa

---

## 🚀 Próximas Etapas (Backend)

Para que tudo funcione 100%, o seu backend precisa:

### 1️⃣ No endpoint /api/users/login
- Retornar `token` (JWT)
- Retornar `user` com dados do usuário

Exemplo:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "joao",
    "email": "joao@example.com",
    "name": "João Silva"
  }
}
```

### 2️⃣ Em TODAS as rotas protegidas
- Verificar o header `Authorization: Bearer <token>`
- Validar o token JWT
- Se inválido → retornar 401
- Se válido → permitir a ação

### 3️⃣ Exemplo de middleware:
```javascript
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Dados do usuário
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

---

## ❓ Dúvidas Frequentes

**P: E se o token expirar enquanto o usuário está usando o app?**
R: O AuthInterceptor detectará o 401 e fará logout automático, redirecionando para /login.

**P: Posso mudar de localStorage para sessionStorage?**
R: Sim! Mude em `auth.service.ts` todas as linhas de `localStorage` para `sessionStorage`. A diferença é que sessionStorage é limpo ao fechar o navegador.

**P: Como adicionar refresh token (token de longa duração)?**
R: Seria necessário adicionar um endpoint `/api/users/refresh` que retorna um novo token usando o refresh token. Deixo como sugestão para melhorias futuras.

**P: O frontend tá enviando o token corretamente, mas o backend retorna 401?**
R: O problema é no backend. Verifique:
1. Se o middleware JWT está validando corretamente
2. Se o JWT_SECRET do backend é o mesmo usado ao gerar o token
3. Se o token não expirou

---

## 📞 Resumo

Você agora tem um **sistema de autenticação JWT completo**:
- ✅ Login com token
- ✅ Token em localStorage
- ✅ Token em todas as requisições
- ✅ Rotas protegidas
- ✅ Logout limpa tudo
- ✅ Logs para debug

**Está pronto para usar!** 🎉
