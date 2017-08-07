import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceErrorComponent } from './service-error.component';

describe('ServiceErrorComponent', () => {
  let component: ServiceErrorComponent;
  let fixture: ComponentFixture<ServiceErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
