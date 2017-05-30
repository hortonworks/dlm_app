import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonComponentsModule } from 'components/common-components.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';

import { PolicyDetailsComponent } from './policy-details.component';
import { JobsTableComponent } from '../../jobs/jobs-table/jobs-table.component';
import { JobStatusComponent } from '../../jobs/job-status/job-status.component';
import { JobTransferredGraphComponent } from '../../jobs/jobs-transferred-graph/job-transferred-graph.component';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { TableComponent } from 'common/table/table.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { NavbarService } from 'services/navbar.service';

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), ChartsModule, NgxDatatableModule, CommonComponentsModule, FormsModule, MomentModule],
      declarations: [
        PolicyDetailsComponent,
        ActionColumnComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        TableComponent,
        TableFooterComponent,
        JobsTableComponent,
        JobStatusComponent,
        JobTransferredGraphComponent,
        BytesSizePipe,
        FrequencyPipe
      ],
      providers: [NavbarService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});