import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { PoliciesComponent } from './policies.component';
import { PolicyTableComponent } from './policy-table/policy-table.component';
import { TableComponent } from 'common/table/table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { CommonComponentsModule } from 'components/common-components.module';
import { PolicyInfoComponent } from './policy-table/policy-info/policy-info.component';
import { FlowStatusComponent } from './policy-table/flow-status/flow-status.component';
import { FormsModule } from '@angular/forms';
import { MockStore } from 'mocks/mock-store';
import { Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { NavbarService } from 'services/navbar.service';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { JobsTableComponent } from '../jobs/jobs-table/jobs-table.component';
import { JobStatusComponent } from '../jobs/job-status/job-status.component';
import { JobTransferredGraphComponent } from '../jobs/jobs-transferred-graph/job-transferred-graph.component';
import { FrequencyPipe } from 'pipes/frequency.pipe';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), NgxDatatableModule, FormsModule, RouterTestingModule, CommonComponentsModule, MomentModule, ChartsModule],
      declarations: [
        PoliciesComponent,
        PolicyTableComponent,
        TableComponent,
        TableFooterComponent,
        PolicyInfoComponent,
        CheckboxComponent,
        ActionColumnComponent,
        FlowStatusComponent,
        CheckboxColumnComponent,
        PolicyDetailsComponent,
        BytesSizePipe,
        FrequencyPipe,
        JobsTableComponent,
        JobStatusComponent,
        JobTransferredGraphComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
