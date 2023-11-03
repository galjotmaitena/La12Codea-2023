import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadoPage } from './empleado.page';

describe('EmpleadoPage', () => {
  let component: EmpleadoPage;
  let fixture: ComponentFixture<EmpleadoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
