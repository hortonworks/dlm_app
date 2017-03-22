import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LakeAddComponent } from './lake-add.component';

describe('LakeAddComponent', () => {
  let component: LakeAddComponent;
  let fixture: ComponentFixture<LakeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LakeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LakeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
