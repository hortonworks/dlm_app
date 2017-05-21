import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { CommonComponentsModule } from 'components/common-components.module';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { MockStore } from 'mocks/mock-store';
import { OverviewComponent } from './overview.component';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { IssuesListItemComponent } from './issues-list-item/issues-list-item.component';
import { ResourceChartsComponent } from './resource-charts/';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { JobStatusComponent } from 'pages/jobs/job-status/job-status.component';
import { JobTransferredGraphComponent } from 'pages/jobs/jobs-transferred-graph/job-transferred-graph.component';
import { TableComponent } from 'common/table/table.component';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { NavbarService } from 'services/navbar.service';
import {FmtTzPipe} from 'pipes/fmt-tz.pipe';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        MomentModule,
        NgxDatatableModule,
        ChartsModule,
        FormsModule,
        ReactiveFormsModule,
        CommonComponentsModule
      ],
      declarations: [
        OverviewComponent,
        IssuesListComponent,
        IssuesListItemComponent,
        ResourceChartsComponent,
        JobsTableComponent,
        JobStatusComponent,
        TableComponent,
        JobTransferredGraphComponent,
        BytesSizePipe,
        TableFooterComponent,
        CheckboxColumnComponent,
        ActionColumnComponent,
        CheckboxComponent,
        FmtTzPipe
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
