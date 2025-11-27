export const environment = {
  production: true,
  
  // Backend API Configuration
  apiBaseUrl: 'https://api.marketmeet.com/api',
  backendHost: 'api.marketmeet.com',
  backendPort: 443,
  
  // WebSocket Configuration
  websocketUrl: 'https://api.marketmeet.com',
  websocketHost: 'api.marketmeet.com',
  websocketPort: 443,
  
  // Frontend Configuration
  frontendUrl: 'https://marketmeet.com',
  
  // API Endpoints
  apiUsersEndpoint: '/api/users',
  apiFeedEndpoint: '/api/feed',
  apiPostsEndpoint: '/api/posts',
  apiProfileEndpoint: '/api/profile',
  
  // Authentication Configuration
  authTokenKey: 'auth_token',
  currentUserKey: 'current_user',
  
  // WebSocket Reconnection Settings
  wsReconnectionDelay: 3000,
  wsReconnectionDelayMax: 30000,
  wsReconnectionAttempts: 10,
  
  // Logging Configuration
  logLevel: 'error',
  
  // API Timeout (em ms)
  apiTimeout: 30000
};
