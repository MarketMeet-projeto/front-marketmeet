# ✅ Configuração de Variáveis de Ambiente Aplicada

## Resumo das Alterações

Este documento resume as mudanças realizadas para aplicar corretamente as configurações de variáveis de ambiente no projeto MarketMeet Frontend.

### Arquivos Criados

1. **`src/environments/environment.ts`** - Configurações para desenvolvimento
2. **`src/environments/environment.prod.ts`** - Configurações para produção
3. **`src/app/config/app.environment.ts`** - Classe utilitária para acessar configurações
4. **`ENV_CONFIGURATION.md`** - Documentação completa sobre variáveis de ambiente

### Arquivos Modificados

#### 1. **`angular.json`**
- Adicionado `fileReplacements` para substituir `environment.ts` por `environment.prod.ts` no build de produção

#### 2. **Serviços de API**
- **`src/services/api.service.ts`** - Atualizado para usar `environment.apiBaseUrl`
- **`src/services/auth.service.ts`** - Atualizado para usar `environment` (URL API + token key)
- **`src/services/follow.service.ts`** - Atualizado para usar `environment.apiBaseUrl`
- **`src/services/websocket.service.ts`** - Atualizado para usar `environment.websocketUrl` e configurações de reconexão

#### 3. **Componentes de Login**
- **`src/login/app/services/auth.service.ts`** - Atualizado com `environment.apiBaseUrl` e `environment.authTokenKey`
- **`src/login/app/app.component.ts`** - Atualizado para usar `environment.apiBaseUrl`

#### 4. **Componentes de Cadastro**
- **`src/cadastro/app/app.component.ts`** - Atualizado para usar `environment.apiBaseUrl`

#### 5. **Serviços de Timeline**
- **`src/timeline/app/services/feed.service.ts`** - Atualizado para usar `environment.apiBaseUrl`

## Estrutura de Configuração

### Desenvolvimento (`environment.ts`)
```typescript
{
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  websocketUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:4200',
  wsReconnectionDelay: 1000,
  wsReconnectionDelayMax: 5000,
  wsReconnectionAttempts: 5,
  logLevel: 'debug',
  apiTimeout: 30000
}
```

### Produção (`environment.prod.ts`)
```typescript
{
  production: true,
  apiBaseUrl: 'https://api.marketmeet.com/api',
  websocketUrl: 'https://api.marketmeet.com',
  frontendUrl: 'https://marketmeet.com',
  wsReconnectionDelay: 3000,
  wsReconnectionDelayMax: 30000,
  wsReconnectionAttempts: 10,
  logLevel: 'error',
  apiTimeout: 30000
}
```

## Como Usar

### 1. Em Componentes e Serviços
```typescript
import { environment } from '../environments/environment';

export class MyService {
  private apiUrl = environment.apiBaseUrl;
  
  constructor(private http: HttpClient) {
    console.log('API:', environment.apiBaseUrl);
  }
}
```

### 2. Usando a Classe Utilitária
```typescript
import { AppEnvironment } from '../app/config/app.environment';

// Obter configurações
const apiUrl = AppEnvironment.getApiBaseUrl();
const wsUrl = AppEnvironment.getWebSocketUrl();
const wsConfig = AppEnvironment.getWebSocketConfig();

// Validar configurações
if (AppEnvironment.validateConfig()) {
  console.log('Configurações OK!');
}

// Imprimir debug (apenas em desenvolvimento)
AppEnvironment.printConfig();
```

## Variáveis de Ambiente Disponíveis

| Variável | Desenvolvimento | Produção | Descrição |
|----------|---|---|---|
| `apiBaseUrl` | `http://localhost:3000/api` | `https://api.marketmeet.com/api` | URL base para requisições HTTP |
| `websocketUrl` | `http://localhost:3000` | `https://api.marketmeet.com` | URL do servidor WebSocket |
| `frontendUrl` | `http://localhost:4200` | `https://marketmeet.com` | URL do frontend |
| `authTokenKey` | `auth_token` | `auth_token` | Chave no localStorage para token |
| `currentUserKey` | `current_user` | `current_user` | Chave no localStorage para usuário |
| `apiTimeout` | `30000` | `30000` | Timeout HTTP em ms |
| `wsReconnectionDelay` | `1000` | `3000` | Delay inicial de reconexão (ms) |
| `wsReconnectionDelayMax` | `5000` | `30000` | Delay máximo de reconexão (ms) |
| `wsReconnectionAttempts` | `5` | `10` | Tentativas de reconexão |
| `logLevel` | `debug` | `error` | Nível de logging |

## Executar Aplicação

### Desenvolvimento
```bash
npm start
# Usa: src/environments/environment.ts
```

### Build Produção
```bash
npm run build -- --configuration production
# Usa: src/environments/environment.prod.ts
```

### Testar Build Produção Localmente
```bash
npm run build -- --configuration production
npx http-server dist/cadastro/
# Acesse: http://localhost:8080
```

## Validação

Todas as URLs hardcoded foram removidas. A aplicação agora usar somente as configurações em `environment.ts` e `environment.prod.ts`.

### Checklist de Validação
- ✅ `src/services/api.service.ts` - Usa `environment.apiBaseUrl`
- ✅ `src/services/auth.service.ts` - Usa `environment`
- ✅ `src/services/follow.service.ts` - Usa `environment.apiBaseUrl`
- ✅ `src/services/websocket.service.ts` - Usa `environment`
- ✅ `src/login/app/services/auth.service.ts` - Usa `environment`
- ✅ `src/login/app/app.component.ts` - Usa `environment.apiBaseUrl`
- ✅ `src/cadastro/app/app.component.ts` - Usa `environment.apiBaseUrl`
- ✅ `src/timeline/app/services/feed.service.ts` - Usa `environment.apiBaseUrl`
- ✅ `angular.json` - Configurado com `fileReplacements`

## Próximos Passos

### Para Desenvolvimento
1. Inicie o backend em `http://localhost:3000`
2. Execute `npm start`
3. A aplicação conectará automaticamente ao backend

### Para Produção
1. Atualize `environment.prod.ts` com URLs reais
2. Execute `npm run build -- --configuration production`
3. Faça deploy da pasta `dist/cadastro/`

### Adicionar Suporte a .env (Opcional)
Se quiser usar um arquivo `.env` real (não suportado nativamente pelo Angular), você pode:

1. Instalar `dotenv`:
   ```bash
   npm install dotenv
   ```

2. Criar loader em `src/load-env.ts`:
   ```typescript
   import * as dotenv from 'dotenv';
   dotenv.config();
   ```

3. Importar no `main.ts` antes de outras importações

## Troubleshooting

### Erro: "Cannot find module 'environment'"
- Certifique-se de que `src/environments/` existe com `environment.ts`
- Execute `npm install`

### API retorna 404
- Verifique se `environment.apiBaseUrl` está correto
- Confirme que o backend está rodando
- Verifique logs do navegador (F12 > Console)

### WebSocket não conecta
- Verifique se `environment.websocketUrl` aponta para servidor correto
- Confirme que o servidor WebSocket está rodando
- Verifique se está usando `http://` ou `https://` corretamente

## Contato

Para dúvidas ou melhorias sobre a configuração de ambiente, consulte:
- `ENV_CONFIGURATION.md` - Documentação técnica completa
- Código-fonte dos serviços em `src/services/`
