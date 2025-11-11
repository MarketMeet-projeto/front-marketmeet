# 🔴 401 Unauthorized Debug

## ⚠️ Problema Identificado

```
POST /api/posts/create → 401 Unauthorized
```

O backend está rejeitando com **autenticação falha**.

---

## 🔍 Causas Possíveis

### 1️⃣ **Token não está sendo enviado**
- AuthInterceptor não está injetando `Authorization: Bearer ...`
- Resultado: Backend recebe requisição SEM o header Authorization

### 2️⃣ **Token está expirado**
- Token foi gerado no login, mas JWT expirou
- Resultado: Backend rejeita token inválido

### 3️⃣ **Token está sendo enviado errado**
- `Authorization: eyJ...` (falta "Bearer ")
- `Authorization: bearer eyJ...` (minúscula, backend espera maiúscula)
- Resultado: Backend não reconhece formato

### 4️⃣ **Middleware JWT no backend está quebrado**
- `jwt.verify()` está falhando
- JWT_SECRET não bate
- Resultado: Token válido mas middleware rejeita

### 5️⃣ **Header Authorization não está chegando ao backend**
- CORS bloqueando header
- Middleware não reconhecendo header
- Resultado: Backend não vê o token

---

## 🧪 Teste 1: Verificar se Token Existe

**F12 → Console:**
```javascript
localStorage.getItem('auth_token')
```

**Resultado esperado:**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvYW8iLCJpYXQiOjE3MzE1NjM0ODIsImV4cCI6MTczMTY1MzQ4Mn0.xyz..."
```

**Se retornar:**
- ✅ `"eyJ..."`  → Token existe, vá para Teste 2
- ❌ `null` → Token não foi salvo, faça login de novo

---

## 🧪 Teste 2: Decodificar o Token

**F12 → Console:**
```javascript
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

**Resultado esperado:**
```javascript
{
  id: 1,
  name: "João",
  email: "joao@email.com",
  iat: 1731563482,
  exp: 1731653482
}
```

**Verificar:**
- ✅ `id` existe? Se sim, continue
- ✅ `exp` (expiração) é maior que agora? 
  ```javascript
  console.log('Expira em:', new Date(payload.exp * 1000));
  // Deve ser data futura
  ```

---

## 🧪 Teste 3: Verificar Header Authorization

**F12 → Network → POST /api/posts/create → Headers**

Procure por:
```
Authorization: Bearer eyJ...
```

**Resultado esperado:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Se não ver Authorization:**
- ❌ AuthInterceptor não está sendo usado
- ❌ Verificar se está registrado em `app.config.ts`

---

## 🧪 Teste 4: Ver o Erro Exato

**F12 → Network → POST /api/posts/create → Response**

Copie a resposta completa:

```json
{
  "error": "Token não fornecido"
  // ou
  "error": "Token inválido"
  // ou
  "error": "Token expirado"
  // ou
  "message": "Unauthorized"
}
```

---

## 🔧 Soluções Rápidas

### Se Token Não Existe
```javascript
// No console fazer login manualmente:
// 1. Ir para /login
// 2. Preencher email e password
// 3. Clicar em Login
// 4. Voltar para /timeline
```

### Se Token Expirado
```javascript
// No console:
localStorage.clear();
// Depois fazer login de novo
```

### Se Authorization Header Não Vem
```typescript
// Verificar src/app/app.config.ts

// Deve ter:
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([...])),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // ...
  ]
};
```

### Se Retorna "Token não fornecido"
```typescript
// O AuthInterceptor não está funcionando
// Verificar:
// 1. Se está registrado
// 2. Se getToken() está retornando algo
// 3. Se request.clone está correto
```

### Se Retorna "Token inválido"
```javascript
// JWT_SECRET no backend não bate com token
// Solução: Fazer login de novo para pegar token novo
```

---

## 📝 Checklist

- [ ] localStorage tem token? (Teste 1)
- [ ] Token é válido e não expirado? (Teste 2)
- [ ] Header Authorization presente? (Teste 3)
- [ ] Qual é a mensagem de erro exata? (Teste 4)

**Faça os 4 testes acima e me mostre os resultados! 🔍**
