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

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), NgxDatatableModule, FormsModule, MomentModule, ChartsModule],
      declarations: [
        JobsComponent,
        JobsTableComponent,
        JobStatusComponent,
        JobTransferredGraphComponent,
        TableComponent,
        CheckboxComponent,
        CheckboxColumnComponent,
        ActionColumnComponent,
        DropdownComponent,
        BytesSizePipe
      ],
      providers: [
        {provide: Store, useClass: MockStore}
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
