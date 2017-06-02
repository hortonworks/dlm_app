import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import { MyDatePickerModule } from 'mydatepicker';
import {CollapseModule, TabsModule, TypeaheadModule, TimepickerModule} from 'ng2-bootstrap';

import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {MockStore} from 'mocks/mock-store';
import { CommonComponentsModule } from 'components/common-components.module';
import {PolicyFormComponent} from '../../components/policy-form/policy-form.component';
import {CreatePolicyComponent} from './create-policy.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {TableComponent} from 'common/table/table.component';
import {BytesSizePipe} from 'pipes/bytes-size.pipe';
import {MomentModule} from 'angular2-moment';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TableFilterComponent} from 'common/table/table-filter/table-filter.component';
import {ActionColumnComponent} from 'components/table-columns/action-column/action-column.component';
import {NavbarService} from 'services/navbar.service';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';

describe('CreatePolicyComponent', () => {
  let component: CreatePolicyComponent;
  let fixture: ComponentFixture<CreatePolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        CommonComponentsModule,
        TimepickerModule.forRoot(),
        ReactiveFormsModule, CollapseModule, TabsModule.forRoot(), MyDatePickerModule, MomentModule,
        NgxDatatableModule,
        TypeaheadModule
      ],
      declarations: [
        CreatePolicyComponent,
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxListComponent,
        CheckboxComponent,
        HdfsBrowserComponent,
        TableComponent,
        BytesSizePipe,
        TableFooterComponent,
        TableFilterComponent,
        ActionColumnComponent,
        CheckboxColumnComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
