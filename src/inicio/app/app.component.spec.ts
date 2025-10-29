import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call onExplorarIndicacoes when button is clicked', () => {
    spyOn(component, 'onExplorarIndicacoes');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn-primary-large');
    button.click();
    expect(component.onExplorarIndicacoes).toHaveBeenCalled();
  });

  it('should call onVerComoFunciona when button is clicked', () => {
    spyOn(component, 'onVerComoFunciona');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn-secondary-large');
    button.click();
    expect(component.onVerComoFunciona).toHaveBeenCalled();
  });

  it('should call onComunidade when nav link is clicked', () => {
    spyOn(component, 'onComunidade');
    fixture.detectChanges();
    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    navLinks[0].click();
    expect(component.onComunidade).toHaveBeenCalled();
  });

  it('should call onEntrar when nav link is clicked', () => {
    spyOn(component, 'onEntrar');
    fixture.detectChanges();
    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    navLinks[1].click();
    expect(component.onEntrar).toHaveBeenCalled();
  });

  it('should call onPrimeiroAcesso when button is clicked', () => {
    spyOn(component, 'onPrimeiroAcesso');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn-primary');
    button.click();
    expect(component.onPrimeiroAcesso).toHaveBeenCalled();
  });
});
