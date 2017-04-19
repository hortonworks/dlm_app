import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ClusterCardComponent} from './cluster-card.component';
import {CardComponent} from '../../../components/card/card.component';
import {MockTranslateLoader} from '../../../mocks/mock-translate-loader';
import {Cluster} from '../../../models/cluster.model';

describe('ClusterCardComponent', () => {
  let component: ClusterCardComponent;
  let fixture: ComponentFixture<ClusterCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      })],
      declarations: [ClusterCardComponent, CardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{clusterDetails: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
