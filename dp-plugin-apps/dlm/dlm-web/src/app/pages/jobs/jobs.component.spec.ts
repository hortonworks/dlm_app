import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {JobsTableComponent} from './jobs-table/jobs-table.component';
import {JobStatusComponent} from './job-status/job-status.component';
import {JobTransferredGraphComponent} from './jobs-transferred-graph/job-transferred-graph.component';
import {TableComponent} from '../../common/table/table.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {JobsComponent} from './jobs.component';
import {DropdownComponent} from '../../components/dropdown/dropdown.component';
import {CheckboxColumnComponent, ActionColumnComponent} from '../../components/table-columns';
import {CheckboxComponent} from '../../common/checkbox/checkbox.component';
import {FormsModule} from '@angular/forms';
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {MomentModule} from 'angular2-moment';
import {ChartsModule} from 'ng2-charts';
import {RouterTestingModule} from '@angular/router/testing';
import {TableFooterComponent} from '../../common/table/table-footer/table-footer.component';
import { IconColumnComponent } from '../../components/table-columns/icon-column/icon-column.component';
import { TableFilterComponent } from '../../common/table/table-filter/table-filter.component';
import { TypeaheadModule, TooltipModule, ProgressbarModule, BsDropdownModule } from 'ng2-bootstrap';
import { JobsStatusFilterComponent } from './jobs-status-filter/jobs-status-filter.component';
import { NavbarService } from 'services/navbar.service';
import { DurationColumnComponent } from 'components/table-columns/duration-column/duration-column.component';
import { TransferredColumnComponent } from 'components/table-columns/transferred-column/transferred-column.component';
import { PipesModule } from 'pipes/pipes.module';
import { PolicyActionsComponent } from 'components/policy-actions/policy-actions.component';
import { LogService } from 'services/log.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {HttpService} from 'services/http.service';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        TypeaheadModule.forRoot(), NgxDatatableModule, FormsModule, MomentModule, ChartsModule, RouterTestingModule,
        TooltipModule.forRoot(),
        ProgressbarModule.forRoot(),
        PipesModule,
        BsDropdownModule.forRoot()
      ],
      declarations: [
        JobsComponent,
        JobsTableComponent,
        JobStatusComponent,
        JobTransferredGraphComponent,
        JobsStatusFilterComponent,
        TableComponent,
        TableFilterComponent,
        TableFooterComponent,
        CheckboxComponent,
        CheckboxColumnComponent,
        ActionColumnComponent,
        DropdownComponent,
        IconColumnComponent,
        DurationColumnComponent,
        TransferredColumnComponent,
        PolicyActionsComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {provide: ConnectionBackend, useClass: MockBackend},
        {provide: RequestOptions, useClass: BaseRequestOptions},
        {provide: Http, useClass: HttpService},
        Http,
        HttpService,
        NavbarService,
        LogService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
