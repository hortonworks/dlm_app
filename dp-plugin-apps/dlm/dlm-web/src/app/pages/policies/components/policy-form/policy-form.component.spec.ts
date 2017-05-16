import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CollapseModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';
import { MyDatePickerModule } from 'mydatepicker';

import { CommonComponentsModule } from 'components/common-components.module';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {MockStore} from 'mocks/mock-store';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import {PolicyFormComponent} from './policy-form.component';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        TimepickerModule.forRoot(),
        ReactiveFormsModule, FormsModule, CollapseModule, TabsModule.forRoot(), MyDatePickerModule, CommonComponentsModule
      ],
      declarations: [
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxComponent,
        CheckboxListComponent,
        CheckboxColumnComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
