import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeMetresPage } from './home-metres.page';

describe('HomeMetresPage', () => {
  let component: HomeMetresPage;
  let fixture: ComponentFixture<HomeMetresPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeMetresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
