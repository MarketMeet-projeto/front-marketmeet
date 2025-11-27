/**
 * Configurações de Ambiente do MarketMeet Frontend
 * 
 * Este arquivo gerencia todas as variáveis de ambiente da aplicação
 * e fornece funções de utilitário para acessar as configurações
 */

import { environment } from '../../environments/environment';

export class AppEnvironment {
  /**
   * Obtém a URL base da API
   */
  static getApiBaseUrl(): string {
    return environment.apiBaseUrl;
  }

  /**
   * Obtém a URL do WebSocket
   */
  static getWebSocketUrl(): string {
    return environment.websocketUrl;
  }

  /**
   * Obtém a URL do Frontend
   */
  static getFrontendUrl(): string {
    return environment.frontendUrl;
  }

  /**
   * Obtém o modo de execução (production/development)
   */
  static isProduction(): boolean {
    return environment.production;
  }

  /**
   * Obtém o nível de logging
   */
  static getLogLevel(): string {
    return environment.logLevel;
  }

  /**
   * Obtém timeout da API em milissegundos
   */
  static getApiTimeout(): number {
    return environment.apiTimeout;
  }

  /**
   * Obtém configurações de reconexão do WebSocket
   */
  static getWebSocketConfig() {
    return {
      reconnectionDelay: environment.wsReconnectionDelay,
      reconnectionDelayMax: environment.wsReconnectionDelayMax,
      reconnectionAttempts: environment.wsReconnectionAttempts
    };
  }

  /**
   * Imprime as configurações de ambiente (apenas em desenvolvimento)
   */
  static printConfig(): void {
    if (!this.isProduction()) {
      console.group('📋 Configurações do Ambiente');
      console.log('API Base URL:', this.getApiBaseUrl());
      console.log('WebSocket URL:', this.getWebSocketUrl());
      console.log('Frontend URL:', this.getFrontendUrl());
      console.log('Mode:', this.isProduction() ? 'Production' : 'Development');
      console.log('Log Level:', this.getLogLevel());
      console.log('API Timeout:', this.getApiTimeout() + 'ms');
      console.log('WebSocket Config:', this.getWebSocketConfig());
      console.groupEnd();
    }
  }

  /**
   * Valida se as configurações são válidas
   */
  static validateConfig(): boolean {
    const errors: string[] = [];

    if (!environment.apiBaseUrl) {
      errors.push('apiBaseUrl é obrigatório');
    }

    if (!environment.websocketUrl) {
      errors.push('websocketUrl é obrigatório');
    }

    if (!environment.frontendUrl) {
      errors.push('frontendUrl é obrigatório');
    }

    if (environment.apiTimeout <= 0) {
      errors.push('apiTimeout deve ser maior que 0');
    }

    if (errors.length > 0) {
      console.error('❌ Erros de validação de configuração:');
      errors.forEach(error => console.error('  - ' + error));
      return false;
    }

    console.log('✅ Configurações validadas com sucesso');
    return true;
  }
}
