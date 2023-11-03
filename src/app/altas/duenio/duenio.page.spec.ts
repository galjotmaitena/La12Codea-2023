import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DuenioPage } from './duenio.page';

describe('DuenioPage', () => {
  let component: DuenioPage;
  let fixture: ComponentFixture<DuenioPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DuenioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
