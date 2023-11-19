import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioJuegosPage } from './inicio-juegos.page';

describe('InicioJuegosPage', () => {
  let component: InicioJuegosPage;
  let fixture: ComponentFixture<InicioJuegosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InicioJuegosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
