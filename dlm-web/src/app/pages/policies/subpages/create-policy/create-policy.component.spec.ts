import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CreatePolicyComponent} from './create-policy.component';
import {PolicyFormComponent} from '../../components/policy-form/policy-form.component';
import {CollapseModule, TabsModule} from 'ng2-bootstrap';
import {RadioButtonComponent} from '../../../../common/radio-button/radio-button.component';
import {SearchInputComponent} from '../../../../components/search-input/search-input.component';
import {CheckboxListComponent} from '../../../../common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from '../../../../common/checkbox/checkbox.component';
import {MockTranslateLoader} from '../../../../mocks/mock-translate-loader';
import {Store} from '@ngrx/store';
import {MockStore} from '../../../../mocks/mock-store';

describe('CreatePolicyComponent', () => {
  let component: CreatePolicyComponent;
  let fixture: ComponentFixture<CreatePolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), ReactiveFormsModule, CollapseModule, TabsModule],
      declarations: [
        CreatePolicyComponent,
        PolicyFormComponent,
        RadioButtonComponent,
        SearchInputComponent,
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
