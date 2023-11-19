import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimonDicePage } from './simon-dice.page';

describe('SimonDicePage', () => {
  let component: SimonDicePage;
  let fixture: ComponentFixture<SimonDicePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SimonDicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
