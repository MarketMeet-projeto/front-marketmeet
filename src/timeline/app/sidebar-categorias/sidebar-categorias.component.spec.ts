import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCategoriasComponent } from './sidebar-categorias.component';

describe('SidebarCategoriasComponent', () => {
  let component: SidebarCategoriasComponent;
  let fixture: ComponentFixture<SidebarCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCategoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
