import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSugestoesComponent } from './sidebar-sugestoes.component';

describe('SidebarSugestoesComponent', () => {
  let component: SidebarSugestoesComponent;
  let fixture: ComponentFixture<SidebarSugestoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSugestoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSugestoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
