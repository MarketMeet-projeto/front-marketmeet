# 📡 Backend Routes Documentation

## API Base URL
`http://10.51.47.41:3000/api`

---

## 🔐 Authentication Routes

### POST /api/users/login
**Purpose:** Authenticate user and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (401):**
```json
{
  "error": "Email ou senha incorretos"
}
```

---

### POST /api/users/create
**Purpose:** Register a new user

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "birth_date": "01/01/1990"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso!",
  "userId": 1
}
```

**Response (400):**
```json
{
  "error": "Email já existe"
}
```

---

## 📝 Post Routes

### POST /api/posts/create ⭐
**Purpose:** Create a new post/review

**Required Auth:** JWT token via `Authorization: Bearer <token>` header

**Request Body:**
```json
{
  "id_user": 1,
  "caption": "Adorei este produto!",
  "rating": 5,
  "category": "Smartphones",
  "product_photo": "https://example.com/image.jpg",
  "product_url": "iPhone 15 Pro"
}
```

**Field Details:**
| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| `id_user` | Integer | ✅ YES | Must exist in account table | `1` |
| `caption` | String | ❌ Optional | Max 500 chars | `"Great phone!"` |
| `rating` | Integer | ❌ Optional | 1-5 range | `5` |
| `category` | String | ❌ Optional | Max 100 chars | `"Smartphones"` |
| `product_photo` | String | ❌ Optional | Valid URL | `"https://..."` |
| `product_url` | String | ❌ Optional | Max 500 chars | `"iPhone 15 Pro"` |

**Backend Implementation:**
```javascript
app.post('/api/posts/create', checkDB, authMiddleware, (req, res) => {
  const { id_user, rating, caption, category, product_photo, product_url } = req.body;
  
  // Validate: id_user is mandatory
  if (!id_user) {
    return res.status(400).json({
      error: 'ID do usuário é obrigatório'
    });
  }
  
  // Validate rating if provided (must be 1-5)
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({
      error: 'Rating deve estar entre 1 e 5'
    });
  }
  
  // Dynamically build query with only provided fields
  let fields = ['id_user', 'created_at'];
  let placeholders = ['?', 'NOW()'];
  let values = [id_user];
  
  if (rating !== undefined) { fields.push('rating'); placeholders.push('?'); values.push(rating); }
  if (caption !== undefined) { fields.push('caption'); placeholders.push('?'); values.push(caption); }
  if (category !== undefined) { fields.push('category'); placeholders.push('?'); values.push(category); }
  if (product_photo !== undefined) { fields.push('product_photo'); placeholders.push('?'); values.push(product_photo); }
  if (product_url !== undefined) { fields.push('product_url'); placeholders.push('?'); values.push(product_url); }
  
  const query = `INSERT INTO post (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    res.status(201).json({
      success: true,
      message: 'Review criado com sucesso!',
      postId: result.insertId
    });
  });
});
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review criado com sucesso!",
  "postId": 123
}
```

**Response (400):**
```json
{
  "error": "ID do usuário é obrigatório"
}
```

**Response (500):**
```json
{
  "error": "Erro interno do servidor"
}
```

---

### GET /api/posts/timeline ⭐
**Purpose:** Get all posts for the timeline (most recent first)

**Required Auth:** None (public endpoint)

**Request:**
```
GET /api/posts/timeline
```

**Backend Implementation:**
```javascript
app.get('/api/posts/timeline', checkDB, (req, res) => {
  const query = `
    SELECT
      p.id_post,
      p.rating,
      p.caption,
      p.category,
      p.product_photo,
      p.product_url,
      p.created_at,
      a.username,
      a.id_user,
      COUNT(DISTINCT l.id_like) as likes_count,
      COUNT(DISTINCT c.id_comment) as comments_count
    FROM post p
    LEFT JOIN account a ON p.id_user = a.id_user
    LEFT JOIN likes l ON p.id_post = l.id_post
    LEFT JOIN comments c ON p.id_post = c.id_post
    GROUP BY p.id_post
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    res.json({
      success: true,
      posts: results
    });
  });
});
```

**Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "id_post": 1,
      "id_user": 1,
      "username": "john_doe",
      "caption": "Adorei este produto!",
      "rating": 5,
      "category": "Smartphones",
      "product_photo": "https://example.com/image.jpg",
      "product_url": "iPhone 15 Pro",
      "created_at": "2024-11-10T10:30:00Z",
      "likes_count": 5,
      "comments_count": 2
    }
  ]
}
```

**Response (500):**
```json
{
  "error": "Erro interno do servidor"
}
```

---

### POST /api/posts/{id}/like
**Purpose:** Like or unlike a post

**Required Auth:** JWT token via `Authorization: Bearer <token>` header

**Request:**
```
POST /api/posts/123/like
Authorization: Bearer <token>
```

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gostei adicionado!"
}
```

---

### POST /api/posts/{id}/share
**Purpose:** Share a post

**Required Auth:** JWT token via `Authorization: Bearer <token>` header

**Request:**
```
POST /api/posts/123/share
Authorization: Bearer <token>
```

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post compartilhado!"
}
```

---

## � Database Schema

### account table
```sql
CREATE TABLE account (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### post table
```sql
CREATE TABLE post (
  id_post INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT NOT NULL,
  caption VARCHAR(500),
  rating INT CHECK(rating BETWEEN 1 AND 5),
  category VARCHAR(100),
  product_photo VARCHAR(500),
  product_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES account(id_user)
);
```

### likes table
```sql
CREATE TABLE likes (
  id_like INT PRIMARY KEY AUTO_INCREMENT,
  id_post INT NOT NULL,
  id_user INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_post) REFERENCES post(id_post),
  FOREIGN KEY (id_user) REFERENCES account(id_user),
  UNIQUE KEY unique_like (id_post, id_user)
);
```

### comments table
```sql
CREATE TABLE comments (
  id_comment INT PRIMARY KEY AUTO_INCREMENT,
  id_post INT NOT NULL,
  id_user INT NOT NULL,
  comment_text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_post) REFERENCES post(id_post),
  FOREIGN KEY (id_user) REFERENCES account(id_user)
);
```

---

## 🔐 Authentication Middleware

**Required on protected routes:**
```javascript
// Middleware: authMiddleware
const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    // Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user data to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
```

**Applied to:**
- ✅ POST /api/posts/create
- ✅ POST /api/posts/{id}/like
- ✅ POST /api/posts/{id}/share
- ❌ GET /api/posts/timeline (no auth required)

---

## ✅ Frontend Implementation Checklist

- [x] AuthService login saves JWT token
- [x] HTTP Interceptor adds token to requests
- [x] Route Guard protects /timeline and /perfil
- [x] FeedService creates posts with id_user
- [x] Field names match backend expectations
- [x] Only id_user is sent as mandatory
- [x] Optional fields only sent if provided
- [x] Rating validation (1-5) on frontend
- [x] Handle 401 errors (expired token)
- [x] Display error messages from backend
- [x] Automatic logout on 401
- [x] Timeline GET endpoint maps fields correctly

---

## 🚀 Integration Status

| Endpoint | Method | Status | Auth | Notes |
|----------|--------|--------|------|-------|
| /api/users/login | POST | ✅ Ready | No | Returns token |
| /api/users/create | POST | ✅ Ready | No | User registration |
| /api/posts/create | POST | ✅ Ready | JWT | Dynamic field insertion |
| /api/posts/timeline | GET | ✅ Ready | No | Ordered by date DESC |
| /api/posts/{id}/like | POST | ✅ Ready | JWT | Needs testing |
| /api/posts/{id}/share | POST | ✅ Ready | JWT | Needs testing |

---

## 📝 Important Notes

- **Only `id_user` is mandatory** for creating posts
- All other fields (caption, rating, category, product_photo, product_url) are **optional**
- **Rating must be 1-5** if provided
- Backend dynamically builds SQL query with only provided fields
- **Timestamps** (created_at) are automatically set by backend to NOW()
- **Token format:** `Authorization: Bearer <token>` (required space after Bearer)
- **No token on public endpoints** like /api/posts/timeline
- **Frontend must send exact field names** that backend expects

## 🔗 Mapeamento Frontend → Backend

| Frontend | Backend |
|---|---|
| `post.id` | `id_post` |
| `post.author.id` | `id_user` |
| `post.content.texto` | `caption` |
| `post.produto.categoria` | `category` |
| `post.produto.imagem` | `product_photo` |
| `post.produto.nome` | `product_url` |
| `post.produto.nota` | `rating` |
| `post.createdAt` | `created_at` |

---

## ⚙️ Configuração no Frontend

### FeedService
```typescript
// URL Base
private apiUrl = 'http://10.51.47.41:3000/api';

// Criar post
addPost(content: string, produto?: {...}): void

// Criar post (async)
await addPostAsync(content: string, produto?: {...})
```

### Exemplo de Uso
```typescript
// Criar post simples
this.feedService.addPost('Adorei este produto!');

// Criar post com produto
this.feedService.addPost('Melhor compra do ano!', {
  nome: 'https://produto.com',
  categoria: 'Eletrônicos',
  nota: 5,
  imagem: 'https://foto.com/produto.jpg'
});
```

---

## 📋 Status

- ✅ `/api/posts/timeline` - Implementado (GET)
- ✅ `/api/posts/create` - Implementado (POST)
- ✅ `/api/users/login` - Implementado (POST)
- ✅ `/api/users/create` - Implementado (POST)
- ⏳ `/api/posts/{id}/like` - Em desenvolvimento
- ⏳ `/api/posts/{id}/share` - Em desenvolvimento
- ⏳ Comentários - Em desenvolvimento
