import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaPopupComponent } from './persona-popup.component';

describe('PersonaPopupComponent', () => {
  let component: PersonaPopupComponent;
  let fixture: ComponentFixture<PersonaPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonaPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
