# Rota de Seguir/Deixar de Seguir Usuários

## Requisições

### 1. Seguir um usuário

```
POST /api/users/:userId/follow
```

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `userId` (URL param): ID do usuário a seguir

**Corpo da Requisição:**
```json
{}
```

**Respostas Esperadas:**

✅ **Sucesso (200 OK):**
```json
{
  "success": true,
  "message": "Usuário seguido com sucesso"
}
```

❌ **Erro 404 - Usuário não encontrado:**
```json
{
  "success": false,
  "error": "Usuário não encontrado"
}
```

❌ **Erro 400 - Já está seguindo:**
```json
{
  "success": false,
  "error": "Você já está seguindo este usuário"
}
```

❌ **Erro 401 - Não autenticado:**
```json
{
  "success": false,
  "error": "Usuário não autenticado"
}
```

---

### 2. Deixar de seguir um usuário

```
POST /api/users/:userId/unfollow
```

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `userId` (URL param): ID do usuário para deixar de seguir

**Corpo da Requisição:**
```json
{}
```

**Respostas Esperadas:**

✅ **Sucesso (200 OK):**
```json
{
  "success": true,
  "message": "Você deixou de seguir este usuário"
}
```

❌ **Erro 404 - Usuário não encontrado:**
```json
{
  "success": false,
  "error": "Usuário não encontrado"
}
```

❌ **Erro 400 - Não está seguindo:**
```json
{
  "success": false,
  "error": "Você não está seguindo este usuário"
}
```

---

### 3. (Opcional) Obter lista de usuários que estou seguindo

```
GET /api/users/me/following
```

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respostas Esperadas:**

✅ **Sucesso (200 OK):**
```json
{
  "success": true,
  "following": [
    {
      "id_user": 2,
      "username": "user2",
      "nome": "Usuário 2",
      "avatar": "url_avatar"
    },
    {
      "id_user": 3,
      "username": "user3",
      "nome": "Usuário 3",
      "avatar": "url_avatar"
    }
  ]
}
```

---

## Validações no Backend

1. ✅ Verificar se o usuário está autenticado (validar token JWT)
2. ✅ Verificar se o usuário a seguir existe
3. ✅ Verificar se já está seguindo (para POST follow)
4. ✅ Verificar se não está seguindo (para POST unfollow)
5. ✅ Não permitir seguir a si mesmo (opcional)

---

## Exemplo com cURL

### Seguir um usuário

```bash
curl -X POST http://10.51.47.41:3000/api/users/:userId/follow \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Deixar de seguir um usuário

```bash
curl -X POST http://10.51.47.41:3000/api/users/:userId/follow\
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Implementação Sugerida (Node.js/Express)

```typescript
// Seguir um usuário
router.post('/users/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id_user;

    // Validar se o usuário existe
    const user = await db.query('SELECT * FROM usuarios WHERE id_user = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se não é a si mesmo
    if (currentUserId === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode seguir a si mesmo'
      });
    }

    // Verificar se já está seguindo
    const already = await db.query(
      'SELECT * FROM seguindo WHERE id_user = ? AND id_user_seguido = ?',
      [currentUserId, userId]
    );

    if (already.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Você já está seguindo este usuário'
      });
    }

    // Inserir na tabela de seguindo
    await db.query(
      'INSERT INTO seguindo (id_user, id_user_seguido, created_at) VALUES (?, ?, NOW())',
      [currentUserId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Usuário seguido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao seguir usuário'
    });
  }
});

// Deixar de seguir um usuário
router.post('/users/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id_user;

    // Validar se o usuário existe
    const user = await db.query('SELECT * FROM usuarios WHERE id_user = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se está seguindo
    const following = await db.query(
      'SELECT * FROM seguindo WHERE id_user = ? AND id_user_seguido = ?',
      [currentUserId, userId]
    );

    if (following.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Você não está seguindo este usuário'
      });
    }

    // Deletar da tabela de seguindo
    await db.query(
      'DELETE FROM seguindo WHERE id_user = ? AND id_user_seguido = ?',
      [currentUserId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Você deixou de seguir este usuário'
    });
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deixar de seguir usuário'
    });
  }
});
```

---

## Fluxo no Frontend

1. Usuário clica em "Seguir" no botão
2. Frontend faz `POST /api/users/:userId/follow`
3. Se sucesso: Botão muda para "✓ Seguindo" (azul escuro)
4. Se erro: Mostra alerta com mensagem de erro
5. Clicando novamente em "✓ Seguindo" faz `POST /api/users/:userId/unfollow`
6. Se sucesso: Botão volta para "Seguir" (azul claro)

---

## Schema Sugerido (MySQL)

```sql
-- Tabela de relacionamentos de seguindo
CREATE TABLE seguindo (
  id_seguindo INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  id_user_seguido INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_user_seguido) REFERENCES usuarios(id_user) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (id_user, id_user_seguido),
  INDEX idx_id_user (id_user),
  INDEX idx_id_user_seguido (id_user_seguido)
);
```
