import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualInstallCheckComponent } from './manual-install-check.component';

describe('ManualInstallCheckComponent', () => {
  let component: ManualInstallCheckComponent;
  let fixture: ComponentFixture<ManualInstallCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualInstallCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualInstallCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
