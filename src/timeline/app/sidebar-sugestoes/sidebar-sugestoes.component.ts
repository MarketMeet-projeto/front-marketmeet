import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ necessário para *ngFor

@Component({
  selector: 'app-sidebar-sugestoes',
  standalone: true,
  imports: [CommonModule], // ✅ adiciona aqui
  templateUrl: './sidebar-sugestoes.component.html',
  styleUrls: ['./sidebar-sugestoes.component.css']
})
export class SidebarSugestoesComponent {
  sugestoes = [
    { nome: 'Tech Insider', seguidores: '1.2k', avatar: 'assets/tech.jpg' },
    { nome: 'Fashion Mom', seguidores: '856', avatar: 'assets/fashion.jpg' }
  ];
}
