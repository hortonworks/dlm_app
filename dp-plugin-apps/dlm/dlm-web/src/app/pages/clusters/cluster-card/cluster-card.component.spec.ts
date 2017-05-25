import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ClusterCardComponent} from './cluster-card.component';
import {CardComponent} from '../../../components/card/card.component';
import {MockTranslateLoader} from '../../../mocks/mock-translate-loader';
import {BytesSizePipe} from '../../../pipes/bytes-size.pipe';
import {Cluster} from '../../../models/cluster.model';
import {MockStore} from '../../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';

describe('ClusterCardComponent', () => {
  let component: ClusterCardComponent;
  let fixture: ComponentFixture<ClusterCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader},
        }),
        RouterTestingModule
      ],
      declarations: [
        ClusterCardComponent,
        CardComponent,
        BytesSizePipe
      ],
      providers: [
        {provide: Store, useClass: MockStore}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{id: '1', location: {}, stats: { CapacityUsed: 1, CapacityTotal: 5 }};
    component.pairsCount = {1: {clusterId: 1, clusterName: '', pairs: 1}};
    component.policiesCount = {'1': {clusterId: 1, clusterName: '', policies: 1}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
