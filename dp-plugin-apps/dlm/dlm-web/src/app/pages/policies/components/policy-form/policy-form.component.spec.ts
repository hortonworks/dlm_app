import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {PolicyFormComponent} from './policy-form.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from '../../../../mocks/mock-translate-loader';
import {CollapseModule, TabsModule} from 'ng2-bootstrap';
import {RadioButtonComponent} from '../../../../common/radio-button/radio-button.component';
import {SearchInputComponent} from '../../../../components/search-input/search-input.component';
import {CheckboxListComponent} from '../../../../common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from '../../../../common/checkbox/checkbox.component';
import {MockStore} from '../../../../mocks/mock-store';
import {Store} from '@ngrx/store';
import { MyDatePickerModule } from 'mydatepicker';
import {CheckboxColumnComponent} from '../../../../components/table-columns/checkbox-column/checkbox-column.component';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), ReactiveFormsModule, FormsModule, CollapseModule, TabsModule, MyDatePickerModule],
      declarations: [
        PolicyFormComponent,
        RadioButtonComponent,
        SearchInputComponent,
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
