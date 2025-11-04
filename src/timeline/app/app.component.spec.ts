import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarCategoriasComponent } from './sidebar-categorias/sidebar-categorias.component';
import { SidebarSugestoesComponent } from './sidebar-sugestoes/sidebar-sugestoes.component';
import { FeedComponent } from './feed/feed.component';

describe('AppComponent (Home Layout)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HeaderComponent,
        SidebarCategoriasComponent,
        SidebarSugestoesComponent,
        FeedComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app root', () => {
    expect(component).toBeTruthy();
  });

  it('should render header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should render feed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-feed')).toBeTruthy();
  });

  it('should render sidebars', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar-categorias')).toBeTruthy();
    expect(compiled.querySelector('app-sidebar-sugestoes')).toBeTruthy();
  });
});
