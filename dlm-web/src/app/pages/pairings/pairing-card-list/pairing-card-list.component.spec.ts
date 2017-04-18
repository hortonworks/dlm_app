import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairingCardListComponent } from './pairing-card-list.component';

describe('PairingCardListComponent', () => {
  let component: PairingCardListComponent;
  let fixture: ComponentFixture<PairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairingCardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
