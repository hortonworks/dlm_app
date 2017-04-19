import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairingCardComponent } from './pairing-card.component';

describe('PairingCardComponent', () => {
  let component: PairingCardComponent;
  let fixture: ComponentFixture<PairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairingCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
