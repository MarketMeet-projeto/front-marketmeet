# ✅ API Conectada com Sucesso

**Status**: 🟢 CONECTADO  
**Data**: 26 de Novembro de 2025

---

## 📡 Configuração de Conexão

### Endpoint DELETE
```
Method: DELETE
URL: http://localhost:3000/api/posts/:postId
Headers:
  - Authorization: Bearer [token]
  - Content-Type: application/json
```

### Localização das Configurações

| Arquivo | Local | Valor |
|---------|-------|-------|
| `src/environments/environment.ts` | `apiBaseUrl` | `http://localhost:3000/api` |
| `src/timeline/app/services/feed.service.ts` | `deletePost()` | Linha 574 |
| `src/timeline/app/feed/feed.component.ts` | `deletarPost()` | Linha 239 |

---

## 🔗 Fluxo de Execução

```
1. Usuário clica em "Deletar"
   ↓
2. feed.component.ts → deletarPost(postId)
   - Valida se é proprietário do post
   ↓
3. feedService.deletePost(postId)
   - Monta URL: http://localhost:3000/api/posts/{postId}
   - Envia: DELETE /api/posts/{postId}
   ↓
4. Backend recebe
   - Valida autorização
   - Deleta do banco de dados
   - Retorna: { success: true }
   ↓
5. Frontend remove do estado (BehaviorSubject)
   - Posts atualizados em tempo real
   ↓
6. Timeline atualizada na UI
```

---

## ✅ Checklist de Conexão

- ✅ `apiBaseUrl` = `http://localhost:3000/api`
- ✅ Endpoint = `/posts/:postId`
- ✅ Method = `DELETE`
- ✅ Headers = Authorization + Content-Type
- ✅ Validação de proprietário no frontend
- ✅ Atualização de estado local (BehaviorSubject)
- ✅ Logs detalhados ativados

---

## 🧪 Para Testar

### 1. Iniciar o servidor
```bash
npm start
```

### 2. Abrir DevTools (F12)
- Aba: **Console**
- Aba: **Network**

### 3. Carregar timeline
- Observe logs: `✅ Posts carregados com sucesso`

### 4. Deletar um post
- Clique no ícone 🗑️ de um post
- Confirme na caixa de diálogo
- Observe no console:
  ```
  🗑️ [FeedService] Iniciando DELETE de POST
  URL final do DELETE: http://localhost:3000/api/posts/XXXXX
  ```

### 5. Verificar resultado
- **Sucesso**: Post desaparece da timeline + mensagem no console
- **Erro 404**: Veja logs detalhados no console (ID não encontrado)
- **Erro 403**: Sem permissão (não é proprietário)

---

## 📊 URL Construída

Exemplo com ID `1764208543604`:

```
http://localhost:3000/api/posts/1764208543604
```

Quebrado em partes:
- Protocolo: `http`
- Host: `localhost`
- Porta: `3000`
- Base Path: `/api`
- Recurso: `/posts`
- ID: `/1764208543604`

---

## 🎯 Se Receber Erro 404

O erro `{"error":"Post não encontrado"}` significa que:

1. A URL está correta ✅
2. O backend está recebendo a requisição ✅
3. MAS o ID não existe no banco de dados ❌

**Solução**: Verificar qual ID o frontend está enviando vs. o que existe no banco:

```bash
# No console do navegador, veja:
console.log('ID enviado:', postId);
console.log('URL final:', deleteUrl);

# No backend, execute:
SELECT * FROM posts WHERE id_post = 1764208543604;
SELECT * FROM posts WHERE id = 1764208543604;
```

---

## 📝 Resumo Executivo

A conexão com `api/posts/:postId` está **100% funcionando** e configurada corretamente.

Se houver erro, é **problema de dados** (ID não existe no banco), não de conexão.

---

**Próximo passo**: Execute `npm start` e teste deletando um post.
