import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {DropdownComponent} from '../../components/dropdown/dropdown.component';
import {PoliciesComponent} from './policies.component';
import {PolicyTableComponent} from './policy-table/policy-table.component';
import {TableComponent} from '../../common/table/table.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {CheckboxColumnComponent} from '../../components/table-columns/checkbox-column/checkbox-column.component';
import {ActionColumnComponent} from '../../components/table-columns/action-column/action-column.component';
import {CheckboxComponent} from '../../common/checkbox/checkbox.component';
import {FormsModule} from '@angular/forms';
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), NgxDatatableModule, FormsModule, RouterTestingModule],
      declarations: [
        PoliciesComponent,
        DropdownComponent,
        PolicyTableComponent,
        TableComponent,
        CheckboxComponent,
        CheckboxColumnComponent,
        ActionColumnComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore}
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
