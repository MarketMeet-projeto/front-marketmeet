# 🔐 JWT Authentication - Visual Guide

## 1️⃣ Login Flow (Fluxo de Login)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USER enters email + password                                    │
│          ↓                                                        │
│  [Login Component]                                               │
│          ↓                                                        │
│  calls authService.login(email, password)                        │
│          ↓                                                        │
│  HttpClient makes POST request                                   │
│          ↓                                                        │
│  [AuthInterceptor]                                               │
│  (but no token yet, so header is empty)                          │
│          ↓                                                        │
└─────────────────────────────────────────────────────────────────┘
        ↓ HTTP POST /api/users/login
        ↓ Body: { email, password }
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/users/login handler                                   │
│          ↓                                                        │
│  Validate email + password against database                      │
│          ↓                                                        │
│  If valid:                                                       │
│    - Generate JWT token: jwt.sign(user_data, secret)            │
│    - Return { token: "eyJ...", user: {...} }                     │
│                                                                   │
│  If invalid:                                                     │
│    - Return 401 { error: "Invalid credentials" }                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        ↑ HTTP 200 with { token, user }
        ↑
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [AuthService receives response]                                 │
│          ↓                                                        │
│  localStorage.setItem('auth_token', response.token)              │
│          ↓                                                        │
│  localStorage.setItem('current_user', JSON.stringify(user))      │
│          ↓                                                        │
│  currentUserSubject.next(user)  ← Updates Observable             │
│          ↓                                                        │
│  [Login Component receives response]                             │
│          ↓                                                        │
│  router.navigate(['/timeline'])                                  │
│          ↓                                                        │
│  [AuthGuard checks isAuthenticated()]                            │
│          ↓                                                        │
│  true → Allow access                                             │
│          ↓                                                        │
│  [TimelineComponent loads]                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Request with Token Flow (Requisição com Token)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [FeedComponent]                                                 │
│          ↓                                                        │
│  this.http.post('/api/posts/create', postData)                  │
│          ↓                                                        │
│  [HttpClient]                                                    │
│          ↓                                                        │
│  [AuthInterceptor intercepts]                                    │
│          ↓                                                        │
│  const token = localStorage.getItem('auth_token')                │
│          ↓                                                        │
│  request = request.clone({                                       │
│    setHeaders: {                                                 │
│      Authorization: `Bearer ${token}`                            │
│    }                                                             │
│  })                                                              │
│          ↓                                                        │
│  next.handle(request)  ← Send with token                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        ↓ HTTP POST /api/posts/create
        ↓ Headers: { Authorization: "Bearer eyJ..." }
        ↓ Body: { caption, category, rating, ... }
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/posts/create handler                                  │
│          ↓                                                        │
│  [JWT Middleware]                                                │
│          ↓                                                        │
│  Extract token from Authorization header                         │
│  (splits "Bearer eyJ..." to get "eyJ...")                        │
│          ↓                                                        │
│  jwt.verify(token, secret)                                       │
│          ↓                                                        │
│  If valid:                                                       │
│    - Extract user data from token                                │
│    - req.user = decoded_user_data                                │
│    - Continue to route handler                                   │
│                                                                   │
│  If invalid/expired:                                             │
│    - Return 401 { error: "Invalid token" }                       │
│                                                                   │
│  If no token:                                                    │
│    - Return 401 { error: "Token required" }                      │
│          ↓                                                        │
│  [If valid, execute action]                                      │
│          ↓                                                        │
│  db.insert('posts', {                                            │
│    id_user: req.user.id,  ← From decoded token                  │
│    caption: body.caption,                                        │
│    ...                                                           │
│  })                                                              │
│          ↓                                                        │
│  Return 200 { success: true, post: {...} }                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        ↑ HTTP 200 or 401
        ↑
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [AuthInterceptor handles response]                              │
│          ↓                                                        │
│  if (status === 401) {                                           │
│    authService.logout()  ← Remove token                          │
│    router.navigate(['/login'])  ← Go to login                    │
│  }                                                               │
│          ↓                                                        │
│  [FeedComponent receives response]                               │
│          ↓                                                        │
│  Display post or show error                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Protected Routes Flow (Rotas Protegidas)

```
USER clicks on /timeline
        ↓
Router checks: canActivate: [AuthGuard]
        ↓
[AuthGuard.canActivate()]
        ↓
authService.isAuthenticated()
        ↓
Is there a token in localStorage?
        ↓
    ┌───────────────┬──────────────┐
    ↓               ↓               ↓
   YES              NO            null
    ↓               ↓               ↓
 return true    return false    return false
    ↓               ↓               ↓
Allow            Block           Block
access         & redirect      & redirect
   ↓           to /login       to /login
  Load
component
```

---

## 4️⃣ Logout Flow (Sair)

```
USER clicks "Logout"
        ↓
[Timeline Component]
        ↓
this.authService.logout()
        ↓
[AuthService.logout()]
        ↓
localStorage.removeItem('auth_token')
        ↓
localStorage.removeItem('current_user')
        ↓
currentUserSubject.next(null)  ← Clear user
        ↓
[Timeline Component]
        ↓
router.navigate(['/login'])
        ↓
USER is at /login
Token is gone from localStorage
AuthGuard will block /timeline access
```

---

## 5️⃣ Token Storage Structure (Estrutura do localStorage)

```javascript
// localStorage keys:

1. auth_token
   Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2FvIiwiaWF0IjoxNjk0NDY0NTEyLCJleHAiOjE2OTQ1NTA5MTJ9.abc123..."
   
   Structure of JWT:
   ├─ Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   │  └─ { "alg": "HS256", "typ": "JWT" }
   │
   ├─ Payload: eyJpZCI6MSwidXNlcm5hbWUiOiJqb2FvIiwiaWF0IjoxNjk0NDY0NTEyLCJleHAiOjE2OTQ1NTA5MTJ9
   │  └─ { "id": 1, "username": "joao", "iat": 1694464512, "exp": 1694550912 }
   │
   └─ Signature: abc123...
      └─ HMACSHA256(base64(header) + "." + base64(payload), secret)

2. current_user
   Value: {
     "id": 1,
     "username": "joao",
     "email": "joao@example.com",
     "name": "João Silva"
   }
```

---

## 6️⃣ HTTP Headers with Token (Headers HTTP com Token)

```
Before (sem autenticação):
──────────────────────────
GET /api/posts/timeline HTTP/1.1
Host: 10.51.47.41:3000
Content-Type: application/json


After (com autenticação via interceptor):
─────────────────────────────────────────
GET /api/posts/timeline HTTP/1.1
Host: 10.51.47.41:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

                    ↑
              Added by AuthInterceptor
```

---

## 7️⃣ Error Handling Flow (Tratamento de Erros)

```
HTTP Request with token
        ↓
Backend validates token
        ↓
    ┌───────────────────────┬─────────────────────┐
    ↓                       ↓                       ↓
Valid Token           Invalid/Expired           No Token
    ↓                       ↓                       ↓
200 OK               401 Unauthorized        401 Unauthorized
Execute action       (token expired)         (missing header)
Return data               ↓                       ↓
    ↓                ┌─────────────────────────────┘
    ↓                ↓
[AuthInterceptor]
        ↓
if (error.status === 401) {
  authService.logout()  ← Remove all auth data
  router.navigate(['/login'])  ← Redirect to login
  alert('Session expired')
}
```

---

## 8️⃣ File Structure (Estrutura de Arquivos)

```
src/
├── app/
│   ├── interceptors/
│   │   └── auth.interceptor.ts ← NEW
│   │       └─ Adds token to headers
│   │
│   ├── guards/
│   │   └── auth.guard.ts ← NEW
│   │       └─ Protects routes
│   │
│   └── app.config.ts ← MODIFIED
│       └─ Registers interceptor
│
├── login/
│   └── app/
│       └── services/
│           └── auth.service.ts ← MODIFIED
│               ├─ login()
│               ├─ logout()
│               ├─ getToken()
│               └─ isAuthenticated()
│
├── timeline/
│   └── app/
│       ├── services/
│       │   └── feed.service.ts ← MODIFIED
│       │       └─ Uses authenticated user
│       │
│       └── app.component.ts ← MODIFIED
│           └─ logout() method
│
└── app.routes.ts ← MODIFIED
    └─ canActivate: [AuthGuard]
```

---

## ✅ Complete Checklist

- [x] AuthService saves token to localStorage
- [x] AuthService provides getToken() and isAuthenticated()
- [x] AuthInterceptor adds token to all requests
- [x] AuthInterceptor handles 401 errors
- [x] AuthGuard protects routes
- [x] Routes have canActivate: [AuthGuard]
- [x] FeedService uses authenticated user
- [x] Logout clears everything
- [x] Documentation complete
- [x] Error handling in place

---

## 🧪 Testing Checklist

- [ ] Can login successfully
- [ ] Token is saved in localStorage
- [ ] Token appears in Network tab > Headers
- [ ] Can access /timeline after login
- [ ] Cannot access /timeline without login (redirected to /login)
- [ ] Posts are created with correct user ID
- [ ] Logout removes token from localStorage
- [ ] Cannot access /timeline after logout
- [ ] Console shows debug messages
- [ ] 401 error triggers automatic logout

---

**All set! Your JWT authentication is ready! 🚀**
