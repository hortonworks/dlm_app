import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from '../cluster-card/cluster-card.component';
import {ClusterListComponent} from './cluster-list.component';
import {CardComponent} from '../../../components/card/card.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ClusterListComponent', () => {
  let component: ClusterListComponent;
  let fixture: ComponentFixture<ClusterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule],
      declarations: [ClusterListComponent, ClusterCardComponent, CardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
