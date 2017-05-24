import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClustersComponent} from './clusters.component';
import {ClusterSearchComponent} from './cluster-search/cluster-search.component';
import {ClusterListComponent} from './cluster-list/cluster-list.component';
import {SearchInputComponent} from '../../components/search-input/search-input.component';
import {DropdownComponent} from '../../components/dropdown/dropdown.component';
import {ClusterCardComponent} from './cluster-card/cluster-card.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {CardComponent} from '../../components/card/card.component';
import {MapComponent} from '../../components/map/map.component';
import {BytesSizePipe} from '../../pipes/bytes-size.pipe';
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {HttpService} from '../../services/http.service';

describe('ClustersComponent', () => {
  let component: ClustersComponent;
  let fixture: ComponentFixture<ClustersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      })],
      declarations: [
        ClustersComponent,
        ClusterSearchComponent,
        ClusterListComponent,
        SearchInputComponent,
        DropdownComponent,
        ClusterCardComponent,
        CardComponent,
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
