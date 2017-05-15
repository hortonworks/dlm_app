import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import { MyDatePickerModule } from 'mydatepicker';
import {CollapseModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';

import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {MockStore} from 'mocks/mock-store';
import { CommonComponentsModule } from 'components/common-components.module';
import {PolicyFormComponent} from '../../components/policy-form/policy-form.component';
import {CreatePolicyComponent} from './create-policy.component';

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
        ReactiveFormsModule, CollapseModule, TabsModule.forRoot(), MyDatePickerModule
      ],
      declarations: [
        CreatePolicyComponent,
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxListComponent,
        CheckboxComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore}
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
