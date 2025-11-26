# Rota DELETE para Deletar Posts

## Requisição

```
DELETE /api/posts/:postId
```

## Headers Obrigatórios

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Parâmetros

- `postId` (URL param): ID do post a ser deletado

## Validações no Backend

1. ✅ Verificar se o usuário está autenticado (validar token JWT)
2. ✅ Verificar se o post existe
3. ✅ Verificar se o usuário autenticado é o proprietário do post
4. ✅ Se não for o proprietário, retornar erro 403 (Forbidden)

## Respostas Esperadas

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Post deletado com sucesso"
}
```

### Erro 404 - Post não encontrado

```json
{
  "success": false,
  "error": "Post não encontrado"
}
```

### Erro 403 - Sem permissão

```json
{
  "success": false,
  "error": "Você não tem permissão para deletar este post"
}
```

### Erro 401 - Não autenticado

```json
{
  "success": false,
  "error": "Usuário não autenticado"
}
```

## Exemplo com cURL

```bash
curl -X DELETE http://10.51.47.41:3000/api/posts/123 \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json"
```

## Implementação Sugerida (Node.js/Express)

```typescript
// Rota DELETE
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id_user; // Do token JWT

    // Verificar se o post existe
    const post = await db.query('SELECT * FROM posts WHERE id_post = ?', [postId]);
    if (post.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário
    if (post[0].id_user !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para deletar este post'
      });
    }

    // Deletar o post
    await db.query('DELETE FROM posts WHERE id_post = ?', [postId]);

    res.status(200).json({
      success: true,
      message: 'Post deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar post'
    });
  }
});
```

## Fluxo no Frontend

1. Usuário clica no botão de deletar
2. Solicita confirmação: "Tem certeza que deseja deletar este post?"
3. Se confirmar, faz requisição `DELETE /api/posts/:postId`
4. Se sucesso (200): Remove o post da lista local
5. Se erro (403): Mostra alerta "Você não tem permissão"
6. Se erro (404): Mostra alerta "Post não encontrado"
7. Se erro (500): Mostra alerta "Erro ao deletar post"
