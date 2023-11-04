import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeClientesPage } from './home-clientes.page';

describe('HomeClientesPage', () => {
  let component: HomeClientesPage;
  let fixture: ComponentFixture<HomeClientesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
