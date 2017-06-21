import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DpOnboardComponent } from './dp-onboard.component';

describe('DpOnboardComponent', () => {
  let component: DpOnboardComponent;
  let fixture: ComponentFixture<DpOnboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DpOnboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DpOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
