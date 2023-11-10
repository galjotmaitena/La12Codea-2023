import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeDuenioPage } from './home-duenio.page';

describe('HomeDuenioPage', () => {
  let component: HomeDuenioPage;
  let fixture: ComponentFixture<HomeDuenioPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeDuenioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
