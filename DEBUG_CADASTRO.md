# 🔍 Diagnóstico - Problema de Cadastro de Usuário

## ❌ Problema Identificado
Usuário não está sendo criado. Pode ser Frontend ou Backend.

---

## 📋 Passo 1: Verificar o que o Frontend está ENVIANDO

1. Abra o navegador (F12)
2. Vá para a aba **Network** ou **Console**
3. Preencha o formulário de cadastro e clique em "Criar"
4. Procure pela requisição para `http://10.51.47.41:3000/api/users/create`
5. Verifique o **Body** (corpo da requisição)

**Deverá ver algo assim:**
```json
{
  "username": "joao123",
  "email": "joao@example.com",
  "password": "senha123",
  "birth_date": "01/01/2000"
}
```

---

## 📋 Passo 2: Verificar a RESPOSTA do Backend

Na mesma requisição do Network, clique em **Response** para ver o que o backend retornou.

**Possíveis Respostas:**

### ✅ Sucesso
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "userId": 123
}
```

### ❌ Erro 400 (Bad Request)
```json
{
  "error": "Faltam campos obrigatórios"
}
```
**Solução**: Verificar quais campos o backend espera

### ❌ Erro 500 (Server Error)
```json
{
  "error": "Erro interno do servidor"
}
```
**Solução**: Problema no backend, não é culpa do frontend

---

## 🧪 Passo 3: Testar no Console (F12)

Cole isto no console:
```javascript
fetch('http://10.51.47.41:3000/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'teste123',
    email: 'teste@example.com',
    password: 'senha123',
    birth_date: '01/01/2000'
  })
})
  .then(r => r.json())
  .then(data => console.log('Resposta:', data))
  .catch(e => console.error('Erro:', e))
```

Veja o que aparece no console.

---

## 🔍 Passo 4: Checar Estrutura da API de Usuários

**Você precisa informar:**

1. **Qual é a estrutura exata da tabela de usuários no seu banco?**
   ```sql
   DESCRIBE account;  -- ou sua tabela de usuários
   ```

2. **Qual endpoint exato de cadastro você tem?**
   - POST `/api/users/create` ✓
   - POST `/api/users/register`
   - POST `/api/users/signup`

3. **Quais campos são obrigatórios?**
   - username
   - email
   - password
   - birth_date
   - Outros?

---

## 💡 Dicas para Debug

### Verificar Logs no Console do Angular
Abra F12 → Console e procure por:
- `📤 Dados enviados para o backend:` - Mostra o que foi enviado
- `✅ Resposta do backend:` - Mostra a resposta
- `❌ Erro ao criar conta:` - Mostra erros com detalhes

### Testar com CURL
```bash
curl -X POST http://10.51.47.41:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste123",
    "email": "teste@example.com",
    "password": "senha123",
    "birth_date": "01/01/2000"
  }'
```

---

## ✅ Checklist de Diagnóstico

- [ ] Verifiquei o Network Inspector (F12)
- [ ] Vi a requisição sendo enviada
- [ ] Li a resposta do backend
- [ ] Copiei a mensagem de erro (se houver)
- [ ] Testei no console com fetch()
- [ ] Testei com CURL no terminal

---

## 📞 Próximo Passo

Depois de rodar estes testes, me diga:
1. **Qual é o erro/resposta do backend?**
2. **Qual é a estrutura da tabela de usuários?**
3. **O erro é `400`, `500` ou outro?**

Assim consigo ajudar a corrigir! 🔧
