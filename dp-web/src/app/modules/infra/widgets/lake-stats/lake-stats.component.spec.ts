import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LakeStatsComponent } from './lake-stats.component';

describe('LakeStatsComponent', () => {
  let component: LakeStatsComponent;
  let fixture: ComponentFixture<LakeStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LakeStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LakeStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
