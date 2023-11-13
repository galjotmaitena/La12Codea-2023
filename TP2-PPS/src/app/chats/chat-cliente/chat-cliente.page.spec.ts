import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatClientePage } from './chat-cliente.page';

describe('ChatClientePage', () => {
  let component: ChatClientePage;
  let fixture: ComponentFixture<ChatClientePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
