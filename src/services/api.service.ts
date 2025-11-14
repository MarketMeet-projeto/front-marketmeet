import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // IP e porta do backend centralizado (usar localhost em desenvolvimento)
  private readonly apiBaseUrl = 'http://localhost:3000/api';

  constructor() { }

  // URLs de usuários
  getCreateUserUrl(): string {
    return `${this.apiBaseUrl}/users/create`;
  }

  getLoginUrl(): string {
    return `${this.apiBaseUrl}/users/login`;
  }

  // Adicione outras rotas conforme necessário
  getUserUrl(userId: string): string {
    return `${this.apiBaseUrl}/users/${userId}`;
  }

  getFeedUrl(): string {
    return `${this.apiBaseUrl}/feed`;
  }

  getPostsUrl(): string {
    return `${this.apiBaseUrl}/posts`;
  }

  getProfileUrl(): string {
    return `${this.apiBaseUrl}/profile`;
  }

  // Método genérico para obter a base URL
  getBaseUrl(): string {
    return this.apiBaseUrl;
  }
}
