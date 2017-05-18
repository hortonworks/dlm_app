import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDetailsViewComponent } from './asset-details-view.component';

describe('AssetDetailsViewComponent', () => {
  let component: AssetDetailsViewComponent;
  let fixture: ComponentFixture<AssetDetailsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetDetailsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
