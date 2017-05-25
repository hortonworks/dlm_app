import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { CommonComponentsModule } from 'components/common-components.module';
import {ClustersComponent} from './clusters.component';
import {ClusterSearchComponent} from './cluster-search/cluster-search.component';
import {ClusterListComponent} from './cluster-list/cluster-list.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {MapComponent} from '../../components/map/map.component';
import {BytesSizePipe} from '../../pipes/bytes-size.pipe';
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {HttpService} from '../../services/http.service';

xdescribe('ClustersComponent', () => {
  let component: ClustersComponent;
  let fixture: ComponentFixture<ClustersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        CommonComponentsModule
      ],
      declarations: [
        ClustersComponent,
        ClusterSearchComponent,
        ClusterListComponent,
        MapComponent,
        BytesSizePipe
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {provide: ConnectionBackend, useClass: MockBackend},
        {provide: RequestOptions, useClass: BaseRequestOptions},
        {provide: Http, useClass: HttpService},
        Http,
        HttpService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
