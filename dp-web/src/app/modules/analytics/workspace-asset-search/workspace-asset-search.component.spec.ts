import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceAssetSearchComponent } from './workspace-asset-search.component';

describe('WorkspaceAssetSearchComponent', () => {
  let component: WorkspaceAssetSearchComponent;
  let fixture: ComponentFixture<WorkspaceAssetSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceAssetSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceAssetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
