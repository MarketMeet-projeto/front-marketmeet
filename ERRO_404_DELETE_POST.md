# 🔴 PROBLEMA ENCONTRADO: Erro 404 ao Deletar Post

**Status**: ❌ BUG IDENTIFICADO  
**Tipo**: Mapeamento de ID incorreto  
**Severidade**: 🔴 CRÍTICO  
**Data**: 26 de Novembro de 2025

## 🎯 O Problema

Ao clicar em deletar um post, recebemos:
```json
{"error":"Post não encontrado"}
```

Status HTTP: 404

---

## 🔍 Causa Raiz

### Backend está procurando por: `id_post`
```sql
SELECT * FROM posts WHERE id_post = ?
```

### Frontend está enviando: Um ID que pode não corresponder

**Fluxo:**
1. Backend carrega posts com campo `id_post`
2. Frontend mapeia como: `id: safeToString(backendPost.id_post ?? backendPost.id ?? '')`
3. Frontend envia DELETE `/api/posts/${postId}`
4. Backend procura por `id_post = postId`
5. ❌ Não encontra porque o ID não bate

---

## 📊 Comparação: O Que o Frontend Está Fazendo

### Ao Carregar Posts
```typescript
// mapPostFromBackend() - Linha 144
id: safeToString(backendPost.id_post ?? backendPost.id ?? '')
```

Vindo do backend:
```json
{
  "id_post": 1764208543604,
  "id_user": 42,
  "caption": "Meu post",
  ...
}
```

Resultado no Frontend:
```javascript
post.id = "1764208543604"  // ✅ Correto
```

### Ao Deletar Post
```typescript
// deletePost() - Linha 561
const deleteUrl = `${this.apiUrl}/posts/${postId}`;
// Envia: /api/posts/1764208543604
```

Backend tenta:
```sql
SELECT * FROM posts WHERE id_post = 1764208543604
```

❌ **Se o banco não tem este `id_post`, retorna 404**

---

## 🧪 Teste Para Confirmar

1. Abra DevTools (F12)
2. Vá para a aba "Network"
3. Ao carregar posts, procure por: `GET /api/posts/timeline`
4. Na resposta, veja qual é o nome do campo ID:
   - `id_post` ?
   - `id` ?
   - `post_id` ?
   - Outro?

5. Quando deletar, observe o URL enviado:
   - `DELETE /api/posts/1764208543604`
   
6. Verifique se este `id_post` existe no banco de dados do backend

---

## ✅ Possíveis Soluções

### Solução 1: Confirmar Campo de ID Correto (RECOMENDADO)
**Ação**: Verificar no backend qual campo é a chave primária de posts

1. Conectar ao banco de dados
2. Executar: `DESCRIBE posts;` ou `SELECT * FROM posts LIMIT 1;`
3. Confirmar o nome exato do campo ID
4. Atualizar o mapeamento no frontend

**Arquivo a atualizar**: `src/timeline/app/services/feed.service.ts` linha 144

### Solução 2: Usar Campo Alternativo
Se o backend tiver múltiplos IDs (ex: `id` e `id_post`):

```typescript
// Atual:
id: safeToString(backendPost.id_post ?? backendPost.id ?? '')

// Tentar inverter a ordem:
id: safeToString(backendPost.id ?? backendPost.id_post ?? '')
```

### Solução 3: Verificar Backend
O backend pode estar esperando um nome de campo diferente:

```typescript
// Ao invés de:
DELETE /api/posts/123

// Tentar:
DELETE /api/posts/id/123
DELETE /api/post/123
DELETE /posts/123
```

---

## 🔧 Como Debugar

### Via Console do Navegador
```javascript
// 1. Carregar um post
const posts = JSON.parse(localStorage.getItem('posts'));
console.log('ID do post:', posts[0].id);

// 2. Ver qual campo o backend tem
fetch('http://localhost:3000/api/posts/timeline')
  .then(r => r.json())
  .then(data => console.log('Post do backend:', data[0]))
  .catch(console.error)
```

### Via DevTools (F12)
1. Abra Network tab
2. Faça uma ação (carregar posts, deletar)
3. Procure na requisição:
   - **Request**: Qual URL está sendo enviado?
   - **Response**: Qual é o campo ID da resposta?

---

## 📋 Checklist de Investigação

- [ ] Verificar nome do campo ID no banco de dados
- [ ] Confirmar que o campo ID está sendo mapeado corretamente
- [ ] Testar via console: qual ID está sendo enviado?
- [ ] Verificar no backend: este ID existe no banco?
- [ ] Confirmar que o token tem permissão para deletar
- [ ] Testar com `curl` (se disponível)

---

## 🧪 Teste Com cURL

```bash
# Após fazer login, copie o token
TOKEN="seu_token_aqui"
POST_ID="1764208543604"

# Testar DELETE
curl -X DELETE http://localhost:3000/api/posts/$POST_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

**Esperado:**
```
< HTTP/1.1 200 OK
{"success":true,"message":"Post deletado com sucesso"}
```

**Se receber 404:**
```
< HTTP/1.1 404 Not Found
{"error":"Post não encontrado"}
```

Isso confirma que o ID está incorreto no banco.

---

## 📝 Próximos Passos

### 1️⃣ Investigação Imediata
```bash
# No backend, execute:
SELECT id_post, id, post_id, id FROM posts LIMIT 1;
```

### 2️⃣ Validar no Frontend
Adicione este log temporário:

```typescript
// Em feed.service.ts, antes de DELETE
deletePost(postId: string): Observable<any> {
  console.log('🔍 [DEBUG] POST_ID sendo enviado:', postId);
  console.log('🔍 [DEBUG] Tipo do POST_ID:', typeof postId);
  console.log('🔍 [DEBUG] URL completa:', `${this.apiUrl}/posts/${postId}`);
  
  // ... resto do código
}
```

### 3️⃣ Testar no Backend
```javascript
// No backend, adicione este log:
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  console.log('🔍 [DEBUG] postId recebido:', postId);
  console.log('🔍 [DEBUG] Procurando por: id_post =', postId);
  // ... resto do código
});
```

---

## 🎓 Conclusão Temporária

O erro 404 "Post não encontrado" indica que:

1. ✅ A requisição DELETE está sendo enviada corretamente
2. ✅ O servidor está recebendo a requisição
3. ❌ O ID enviado não corresponde ao `id_post` na base de dados

**Próxima Ação**: Verificar quais são os IDs reais dos posts no banco de dados.

---

## 📞 Informações para Suporte Backend

Se precisar reportar para o backend:

```
Erro: POST não encontrado ao deletar
URL: DELETE /api/posts/:postId
Status: 404
Resposta: {"error":"Post não encontrado"}

Possível Causa:
- Campo de ID do post no banco não corresponde ao ID enviado
- Campo ID pode ser: id_post, id, post_id, ou outro

Solução Necessária:
- Confirmar o nome exato do campo de ID nos posts
- Ajustar mapeamento no frontend ou backend
```

---

**Para resolver**: Precisamos saber qual é o campo de ID correto no banco de dados.
