import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeCocinaPage } from './home-cocina.page';

describe('HomeCocinaPage', () => {
  let component: HomeCocinaPage;
  let fixture: ComponentFixture<HomeCocinaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeCocinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
