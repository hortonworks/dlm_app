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
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';

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
        CardComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore}
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
