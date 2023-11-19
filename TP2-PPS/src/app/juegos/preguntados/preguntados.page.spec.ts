import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreguntadosPage } from './preguntados.page';

describe('PreguntadosPage', () => {
  let component: PreguntadosPage;
  let fixture: ComponentFixture<PreguntadosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PreguntadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
