# Configuração de Variáveis de Ambiente - MarketMeet Frontend

## Visão Geral

Este projeto Angular utiliza um sistema de configuração de ambiente robusto para gerenciar diferentes configurações entre desenvolvimento e produção.

## Estrutura de Arquivos

```
src/
├── environments/
│   ├── environment.ts           # Configuração de desenvolvimento (padrão)
│   └── environment.prod.ts      # Configuração de produção
└── app/
    └── config/
        └── app.environment.ts   # Classe utilitária para acessar configurações
```

## Variáveis de Ambiente

### Arquivo `.env` (Raiz do Projeto)

O arquivo `.env` na raiz do projeto documenta todas as variáveis disponíveis:

```env
# Backend API Configuration
NG_APP_API_BASE_URL=http://localhost:3000/api
NG_APP_BACKEND_HOST=localhost
NG_APP_BACKEND_PORT=3000

# WebSocket Configuration
NG_APP_WEBSOCKET_URL=http://localhost:3000
NG_APP_WEBSOCKET_HOST=localhost
NG_APP_WEBSOCKET_PORT=3000

# ... outras configurações
```

## Como Usar

### 1. Acessar Configurações em Serviços

```typescript
import { environment } from '../environments/environment';

export class ApiService {
  private apiBaseUrl = environment.apiBaseUrl;
  // ...
}
```

### 2. Usar a Classe AppEnvironment

```typescript
import { AppEnvironment } from '../app/config/app.environment';

// Obter a URL da API
const apiUrl = AppEnvironment.getApiBaseUrl();

// Obter configurações do WebSocket
const wsConfig = AppEnvironment.getWebSocketConfig();

// Validar configurações
if (AppEnvironment.validateConfig()) {
  console.log('Configurações OK');
}

// Imprimir configurações (apenas em desenvolvimento)
AppEnvironment.printConfig();
```

## Build com Diferentes Configurações

### Desenvolvimento (padrão)
```bash
npm start
# Usa: src/environments/environment.ts
```

### Produção
```bash
npm run build -- --configuration production
# Usa: src/environments/environment.prod.ts
```

## Modificando Configurações

### Para Desenvolvimento
Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  websocketUrl: 'http://localhost:3000',
  // ... outras configurações
};
```

### Para Produção
Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.marketmeet.com/api',
  websocketUrl: 'https://api.marketmeet.com',
  // ... outras configurações
};
```

## Configurações Disponíveis

| Chave | Padrão (Dev) | Propósito |
|-------|------|---------|
| `apiBaseUrl` | `http://localhost:3000/api` | URL base para requisições HTTP |
| `websocketUrl` | `http://localhost:3000` | URL do servidor WebSocket |
| `frontendUrl` | `http://localhost:4200` | URL do frontend |
| `authTokenKey` | `auth_token` | Chave para armazenar token no localStorage |
| `currentUserKey` | `current_user` | Chave para armazenar usuário atual |
| `apiTimeout` | `30000` | Timeout para requisições HTTP (ms) |
| `wsReconnectionDelay` | `1000` | Delay inicial de reconexão WS (ms) |
| `wsReconnectionDelayMax` | `5000` | Delay máximo de reconexão WS (ms) |
| `wsReconnectionAttempts` | `5` | Tentativas de reconexão do WS |
| `logLevel` | `debug` | Nível de log (debug/info/warn/error) |

## Verificação de Configuração

Na inicialização da aplicação, você pode validar as configurações:

```typescript
import { AppEnvironment } from './app/config/app.environment';

// No main.ts ou app.component.ts
if (!AppEnvironment.validateConfig()) {
  console.error('Falha na validação de configuração');
}

AppEnvironment.printConfig();
```

## Variáveis de Ambiente do Sistema (Opcional)

Para usar variáveis do sistema operacional, você pode estender o arquivo de ambiente:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: process.env['NG_APP_API_BASE_URL'] || 'http://localhost:3000/api',
  // ...
};
```

> **Nota**: Angular não lê arquivos `.env` automaticamente. Use ferramentas como `dotenv-webpack` se precisar dessa funcionalidade.

## Troubleshooting

### A configuração não está sendo carregada
- Verifique se você está acessando corretamente via `environment.propriedade`
- Certifique-se de que o arquivo `environment.ts` existe
- Execute `npm install` para garantir que as dependências estão atualizadas

### WebSocket não conecta
- Verifique se `environment.websocketUrl` aponta para o servidor correto
- Confirme se o servidor WebSocket está rodando
- Verifique os logs do navegador (F12 > Console)

### Endpoints da API retornam 404
- Verifique se `environment.apiBaseUrl` está correto
- Confirme que o backend está rodando
- Verifique se todos os endpoints estão configurados corretamente

## Deploy em Produção

Antes de fazer deploy, certifique-se de:

1. Atualizar `environment.prod.ts` com URLs de produção
2. Testar localmente com: `npm run build -- --configuration production`
3. Verificar a saída em `dist/cadastro/`
4. Validar que nenhuma URL hardcoded de desenvolvimento está no código

```bash
# Build para produção
npm run build -- --configuration production

# Iniciar servidor de testes (opcional)
npx http-server dist/cadastro/
```
