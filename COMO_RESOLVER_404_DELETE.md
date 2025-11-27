# 🚀 Como Resolver o Erro 404 ao Deletar Post

**Data**: 26 de Novembro de 2025  
**Status**: 🔧 INVESTIGAÇÃO E FIX APLICADO  
**Severidade**: 🔴 CRÍTICO

---

## 📋 Resumo do Problema

Ao tentar deletar um post, recebe erro:
```json
{"error":"Post não encontrado"}
```

**Causa**: O ID do post enviado não corresponde ao `id_post` no banco de dados.

---

## 🔧 O Que Foi Feito

Adicionamos **logs detalhados** ao código para identificar exatamente qual ID está sendo enviado e qual está no banco de dados.

### Mudanças no `src/timeline/app/services/feed.service.ts`:

#### 1️⃣ Logs ao Carregar Posts
```typescript
// Agora mostra quais campos de ID estão disponíveis:
console.log('id_post:', backendPost.id_post);
console.log('id:', backendPost.id);
console.log('post_id:', backendPost.post_id);
console.log('✅ [FeedService] ID FINAL MAPEADO:', finalId);
```

#### 2️⃣ Logs ao Deletar Post
```typescript
console.group('🗑️ [FeedService] Iniciando DELETE de POST');
console.log('postId recebido:', postId);
console.log('URL final do DELETE:', deleteUrl);
console.groupEnd();
```

#### 3️⃣ Logs na Resposta
```typescript
console.group('✅ [FeedService] Resposta recebida do DELETE');
console.log('Response:', response);
console.log('Success?:', response?.success);
```

#### 4️⃣ Logs do Erro Específico
```typescript
if (error?.status === 404) {
  console.error('⚠️ Erro 404: Post não encontrado');
  console.error('ID enviado:', postId);
  console.error('URL que foi enviada:', deleteUrl);
}
```

---

## 🧪 Instruções de Teste

### Passo 1: Compilar o Projeto
```bash
npm start
```

### Passo 2: Abrir DevTools
```
Pressione: F12 ou Ctrl+Shift+I
Vá para: Console (aba Console)
```

### Passo 3: Carregar a Página
1. Fazer login
2. Carregar timeline (esperar posts carregarem)
3. Observar no console os logs de carregamento

### Passo 4: Procurar pelos Logs de ID
Procure por mensagens como:
```
[FeedService] Campos de ID disponíveis:
id_post: 1764208543604
id: undefined
post_id: undefined
✅ [FeedService] ID FINAL MAPEADO: 1764208543604
```

**Anote o ID final mapeado** ⚠️

### Passo 5: Deletar um Post
1. Clicar em "🗑️ Deletar" de um post
2. Confirmar na caixa de diálogo
3. Observar os logs no console:

```
🗑️ [FeedService] Iniciando DELETE de POST
postId recebido: 1764208543604
Tipo de postId: string
URL final do DELETE: http://localhost:3000/api/posts/1764208543604
```

### Passo 6: Ver o Resultado
Se receber erro 404, verá:
```
❌ [FeedService] ERRO ao deletar post
Status HTTP: 404
Mensagem: 404 Not Found
Resposta completa: {error: "Post não encontrado"}
⚠️ Erro 404: Post não encontrado
ID enviado: 1764208543604
URL que foi enviada: http://localhost:3000/api/posts/1764208543604
Possível causa: O ID do post pode não corresponder ao campo de ID no banco de dados
```

---

## 🎯 O Próximo Passo

Após obter os logs, você precisa:

### 1. Confirmar no Backend
Conectar ao banco de dados e executar:

```sql
-- Para ver a estrutura da tabela
DESCRIBE posts;

-- Para ver um post exemplo
SELECT * FROM posts LIMIT 1;

-- Para ver se o ID existe
SELECT * FROM posts WHERE id_post = 1764208543604;
SELECT * FROM posts WHERE id = 1764208543604;
```

### 2. Comparar IDs
- **ID que o frontend envia**: Visto nos logs do console
- **ID que existe no banco**: Resultado da query acima

**Se forem diferentes**, então o problema é que:
- O backend está retornando o campo errado de ID
- Ou o mapeamento do frontend está pegando o campo errado

### 3. Solucionar
Após identificar o campo correto, atualizar:

```typescript
// Em feed.service.ts linha ~130:
const finalId = safeToString(backendPost.CAMPO_CORRETO ?? '');
```

Por exemplo, se for `id` ao invés de `id_post`:
```typescript
const finalId = safeToString(backendPost.id ?? backendPost.id_post ?? '');
```

---

## 📊 Árvore de Decisão

```
Deletar Post
    ↓
[Erro 404?]
    ├─ SIM
    │   ├─ Ver logs: qual ID foi enviado?
    │   ├─ Verificar banco: este ID existe?
    │   │   ├─ NÃO existe
    │   │   │   └─ PROBLEMA: Campo de ID incorreto no mapeamento
    │   │   │       └─ Atualizar mapPostFromBackend()
    │   │   │
    │   │   └─ SIM existe (mas com outro campo)
    │   │       └─ PROBLEMA: Backend retorna field diferente
    │   │           └─ Ajustar prioridade no mapeamento
    │   │
    │   └─ Reportar problema
    │
    └─ NÃO (Sucesso!)
        └─ Post foi deletado ✅
```

---

## 📝 Arquivo de Referência

Para mais detalhes técnicos, consulte:
- `ERRO_404_DELETE_POST.md` - Análise completa do problema

---

## 💡 Dicas de Debugging

### Ver todos os logs de um único post
```javascript
// No console:
// Filtrar por "1764208543604" (o ID)
console.clear();  // Limpar console
// Fazer ação (carregar posts, deletar)
// Procurar por "1764208543604" nos logs
```

### Ver apenas erros
```javascript
// No console, abrir menu de filtro (🔍)
// Selecionar apenas "Error" e "Warn"
```

### Usar Network Tab
```
1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Filtrar por "posts"
4. Clicar em deletar
5. Ver requisição DELETE /posts/...
6. Clicar para ver detalhes:
   - Request: Qual URL foi enviado?
   - Response: O que o servidor retornou?
```

---

## ✅ Checklist de Resolução

Quando conseguir deletar com sucesso, deve ver:

- ✅ Console mostra: `✅ [FeedService] Post deletado com sucesso`
- ✅ Post desaparece da timeline
- ✅ Network mostra: `DELETE /api/posts/... 200 OK`
- ✅ Response: `{"success":true,"message":"Post deletado com sucesso"}`

---

## 🆘 Se Não Conseguir Resolver

Collect essas informações para pedir ajuda:

1. **Screenshot do Console** (mostrando os logs de DELETE)
2. **ID que foi enviado** (ex: 1764208543604)
3. **Resultado da query SQL**:
   ```sql
   SELECT * FROM posts WHERE id_post = ?;
   SELECT * FROM posts WHERE id = ?;
   ```
4. **URL exata que o frontend enviou** (visto no Network tab)
5. **Resposta exata do servidor** (visto no Network tab)

---

## 📞 Contato

Agora você tem todos os logs necessários para identificar o problema!

**Próxima ação**: Executar os testes acima e coletar os logs.
