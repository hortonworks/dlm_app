import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairingProgressCardComponent } from './pairing-progress-card.component';

describe('PairingProgressCardComponent', () => {
  let component: PairingProgressCardComponent;
  let fixture: ComponentFixture<PairingProgressCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairingProgressCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingProgressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
