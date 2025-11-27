import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AppComponent {
  user = {
    name: 'Tech Insider',
    username: '@techinsider',
    description:
      'Apaixonado pela área de tecnologia, sempre buscando os melhores produtos. Compartilho minha experiência para ajudar os outros compradores a fazer escolhas inteligentes.',
    followers: 1248,
    following: 248,
    rating: 4.9,
    location: 'São Paulo, SP',
    joined: 'Janeiro 2023'
  };

  // Estados
  isFollowing = false;
  activeTab: 'favoritos' | 'avaliacoes' | 'atividades' = 'favoritos';

  // Alterna o estado do botão "Seguir"
  toggleFollow() {
    this.isFollowing = !this.isFollowing;
    this.user.followers += this.isFollowing ? 1 : -1;
  }

  // Simula envio de mensagem
  sendMessage() {
    alert(`Mensagem enviada para ${this.user.name}!`);
  }

  // Alterna a aba ativa
  setActiveTab(tab: 'favoritos' | 'avaliacoes' | 'atividades') {
    this.activeTab = tab;
  }
}
