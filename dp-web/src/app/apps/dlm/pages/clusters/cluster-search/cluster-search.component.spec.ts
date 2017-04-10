import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterSearchComponent } from './cluster-search.component';

describe('ClusterSearchComponent', () => {
  let component: ClusterSearchComponent;
  let fixture: ComponentFixture<ClusterSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
