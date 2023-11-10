import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeBarPage } from './home-bar.page';

describe('HomeBarPage', () => {
  let component: HomeBarPage;
  let fixture: ComponentFixture<HomeBarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeBarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
