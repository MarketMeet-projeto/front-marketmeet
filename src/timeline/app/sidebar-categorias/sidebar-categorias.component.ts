import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importar CommonModule para usar *ngFor

@Component({
  selector: 'app-sidebar-categorias',
  standalone: true,
  imports: [CommonModule],  // <- Adicione isso
  templateUrl: './sidebar-categorias.component.html',
  styleUrls: ['./sidebar-categorias.component.css']
})
export class SidebarCategoriasComponent {
  categorias = ['Smartphones', 'Eletrodomésticos', 'Moda', 'Casa & Decoração', 'Beleza', 'Esportes'];
}
