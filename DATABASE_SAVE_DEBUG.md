# 🔍 DEBUG - Posts Não Sendo Salvos no Banco

## ❌ Problema
```
Ao criar um post:
✅ Frontend envia dados
❌ Backend não salva no banco
❌ Post desaparece ao recarregar página
```

---

## 🧪 Passo 1: Verificar se Requisição Chega ao Backend

### A. Abrir F12 → Network
```
1. Criar um post
2. Procurar por: POST /api/posts/create
3. Ver Status da requisição:
   ✅ 201 Created → Ok, problema no banco
   ❌ 401 Unauthorized → Problema de autenticação
   ❌ 400 Bad Request → Dados inválidos
   ❌ 500 Internal Server Error → Problema no backend
```

### B. Verificar Headers
```
F12 → Network → POST /api/posts/create → Headers

Deve mostrar:
✅ Authorization: Bearer eyJ...
✅ Content-Type: application/json
```

### C. Verificar Request Body
```
F12 → Network → POST /api/posts/create → Payload

Deve mostrar:
✅ id_user: "1"
✅ caption: "meu texto"
✅ (sem campos null/undefined)
```

---

## 🧪 Passo 2: Verificar Resposta do Backend

### A. Status Code
```
✅ 201 Created → Post foi salvo!
⚠️ 400 Bad Request → Campos inválidos
   → Ver error message
⚠️ 401 Unauthorized → Token expirado
   → Fazer login novamente
⚠️ 500 Internal Server Error → Erro no backend
   → Ver logs do servidor
```

### B. Response Body
```
F12 → Network → POST /api/posts/create → Response

Se 201 Created, deve mostrar:
{
  "success": true,
  "message": "Review criado com sucesso!",
  "postId": 123
}

Se erro, mostrará:
{
  "error": "descrição do erro"
}
```

---

## 🧪 Passo 3: Verificar Banco de Dados

### A. Verificar Conexão
```sql
-- Conectar ao MySQL
mysql -u root -p
USE seu_banco;

-- Verificar tabela post existe
SHOW TABLES LIKE 'post';

-- Ver estrutura
DESC post;
```

### B. Verificar Posts Salvos
```sql
-- Ver todos os posts
SELECT * FROM post;

-- Ver últimos posts
SELECT * FROM post ORDER BY created_at DESC LIMIT 5;

-- Contar posts
SELECT COUNT(*) as total FROM post;
```

### C. Verificar Posts do Usuário
```sql
-- Ver posts do usuário 1
SELECT * FROM post WHERE id_user = 1;

-- Ver último post criado
SELECT * FROM post ORDER BY id_post DESC LIMIT 1;
```

---

## 🐛 Possíveis Causas

### 1️⃣ **ID do usuário inválido**

**Problema:** `id_user` enviado não existe no banco

**Verificar:**
```typescript
// No console, ver:
console.log('User:', this.authService.getCurrentUser());
// Deve mostrar: { id: 1, ... }

// Verificar se id existe:
SELECT * FROM account WHERE id_user = <seu_id>;
```

**Solução:**
```typescript
// feed.service.ts - Adicionar validação:
addPost(content: string, produto?: any): void {
  const user = this.currentUser;
  
  // ✅ Validar se usuário existe
  if (!user || !user.id) {
    console.error('❌ Usuário não autenticado');
    return;
  }
  
  const postData: any = {
    id_user: user.id,  // ← CRITICAL: deve ser numérico
    caption: content
  };
  
  console.log('👤 ID do usuário:', user.id, 'Tipo:', typeof user.id);
  // ...
}
```

### 2️⃣ **Token expirado ou inválido**

**Problema:** Backend rejeita com 401

**Verificar:**
```javascript
// F12 → Console
localStorage.getItem('auth_token')
// Deve retornar: eyJ... (não vazio)

// Verificar se é válido:
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Expira em:', new Date(payload.exp * 1000));
```

**Solução:**
```typescript
// Fazer login novamente
await this.authService.login(email, password).toPromise();
// Depois tentar criar post
```

### 3️⃣ **Banco de dados desconectado**

**Problema:** Backend retorna 500 Internal Server Error

**Verificar:**
```bash
# Ver se banco está rodando
mysql -u root -p -e "SELECT 1;"

# Ver logs do backend
grep "error\|Error\|ERROR" /caminho/para/logs/backend.log
```

**Solução:**
```bash
# Reconectar ao banco
service mysql restart
# ou
mysql.server restart  # macOS
```

### 4️⃣ **Campos obrigatórios faltando**

**Problema:** Backend retorna 400 Bad Request

**Verificar:**
```typescript
// Ver exatamente o que está sendo enviado:
console.log('📤 Enviando:', postData);

// Deve conter OBRIGATORIAMENTE:
// - id_user (número)
// - caption (string, pode estar vazio?)
```

**Solução:**
```typescript
// Validar antes de enviar:
if (!postData.id_user) {
  alert('❌ ID do usuário falta!');
  return;
}

if (!postData.caption || postData.caption.trim() === '') {
  alert('❌ Caption vazio!');
  return;
}
```

### 5️⃣ **Middleware de autenticação quebrado**

**Problema:** Mesmo com token válido, retorna 401

**Backend check:**
```javascript
// app.post('/api/posts/create', checkDB, authMiddleware, (req, res) => {
//                                         ^^^^^^^^^^^^^^
// Verificar se authMiddleware está funcionando

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.error('❌ Token falta no header');
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token válido, usuário:', decoded.id);
    next();
  } catch (err) {
    console.error('❌ Token inválido:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

---

## ✅ Checklist de Debug

- [ ] Post está sendo enviado? (F12 → Network)
- [ ] Status da resposta é 201? (F12 → Network)
- [ ] Authorization header presente? (F12 → Headers)
- [ ] ID do usuário é numérico? (console.log)
- [ ] Token não expirado? (localStorage)
- [ ] Banco MySQL está rodando?
- [ ] Tabela post existe e tem colunas corretas?
- [ ] Campo id_user é tipo INTEGER?
- [ ] Middleware de autenticação funciona?

---

## 🔧 Solução Rápida

### Se o POST retorna 201 mas não salva no banco:

```typescript
// 1. Verificar response do backend
this.http.post<any>(`${this.apiUrl}/posts/create`, postData).subscribe({
  next: (response) => {
    console.log('✅ Response:', response);
    console.log('   - Success:', response.success);
    console.log('   - PostId:', response.postId);
    // Se postId vem, foi salvo no banco!
  },
  error: (error) => {
    console.error('❌ Error:', error);
    console.error('   - Status:', error.status);
    console.error('   - Message:', error.error?.error);
  }
});
```

### Se retorna erro, ver qual é:

```javascript
// Backend - Adicionar logs detalhados
app.post('/api/posts/create', checkDB, authMiddleware, (req, res) => {
  console.log('1️⃣ Request recebido');
  console.log('   - Body:', req.body);
  console.log('   - User:', req.user);
  
  const { id_user, caption } = req.body;
  
  if (!id_user) {
    console.log('❌ ID do usuário falta');
    return res.status(400).json({ error: 'ID do usuário falta' });
  }
  
  console.log('2️⃣ Validações passou');
  
  const query = `INSERT INTO post (id_user, caption, created_at) VALUES (?, ?, NOW())`;
  
  console.log('3️⃣ Query:', query);
  console.log('   - Values:', [id_user, caption]);
  
  db.query(query, [id_user, caption], (err, result) => {
    if (err) {
      console.error('4️⃣ ❌ Erro na query:', err);
      return res.status(500).json({ error: 'Erro ao salvar: ' + err.message });
    }
    
    console.log('4️⃣ ✅ Salvo com sucesso, ID:', result.insertId);
    res.status(201).json({
      success: true,
      postId: result.insertId
    });
  });
});
```

---

## 📞 Próximas Ações

1. **Abra F12** → Network
2. **Crie um post**
3. **Procure por POST /api/posts/create**
4. **Verifique o Status Code** (201? 400? 401? 500?)
5. **Veja a resposta** (response body)
6. **Consulte acima** qual é o problema
7. **Aplique a solução** correspondente

---

**Qual é o Status Code que você vê? (201? 400? 401? 500?)**
