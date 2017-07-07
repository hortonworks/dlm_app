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
import {BytesSizePipe} from '../../pipes/bytes-size.pipe';
import {ChartsModule} from 'ng2-charts';
import {RouterTestingModule} from '@angular/router/testing';
import {TableFooterComponent} from '../../common/table/table-footer/table-footer.component';
import { IconColumnComponent } from '../../components/table-columns/icon-column/icon-column.component';
import { TableFilterComponent } from '../../common/table/table-filter/table-filter.component';
import { TypeaheadModule, TooltipModule, ProgressbarModule } from 'ng2-bootstrap';
import { JobsStatusFilterComponent } from './jobs-status-filter/jobs-status-filter.component';
import { NavbarService } from 'services/navbar.service';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';
import { DurationColumnComponent } from 'components/table-columns/duration-column/duration-column.component';
import { StatusFmtPipe } from 'pipes/status-fmt.pipe';

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
        ProgressbarModule.forRoot()
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
        BytesSizePipe,
        IconColumnComponent,
        FmtTzPipe,
        DurationColumnComponent,
        StatusFmtPipe
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
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
