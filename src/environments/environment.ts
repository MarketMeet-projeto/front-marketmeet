// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  
  // Backend API Configuration
  apiBaseUrl: 'http://localhost:3000/api',
  backendHost: 'localhost',
  backendPort: 3000,
  
  // WebSocket Configuration
  websocketUrl: 'http://localhost:3000',
  websocketHost: 'localhost',
  websocketPort: 3000,
  
  // Frontend Configuration
  frontendUrl: 'http://localhost:4200',
  
  // API Endpoints
  apiUsersEndpoint: '/api/users',
  apiFeedEndpoint: '/api/feed',
  apiPostsEndpoint: '/api/posts',
  apiProfileEndpoint: '/api/profile',
  
  // Authentication Configuration
  authTokenKey: 'auth_token',
  currentUserKey: 'current_user',
  
  // WebSocket Reconnection Settings
  wsReconnectionDelay: 1000,
  wsReconnectionDelayMax: 5000,
  wsReconnectionAttempts: 5,
  
  // Logging Configuration
  logLevel: 'debug',
  
  // API Timeout (em ms)
  apiTimeout: 30000
};
