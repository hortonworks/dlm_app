import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationsPageComponent } from './notifications.component';
import { NotificationsTableComponent } from './notifications-table/notifications-table.component';
import { TableComponent } from '../../common/table/table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MockStore } from '../../mocks/mock-store';
import { Store } from '@ngrx/store';
import { MomentModule } from 'angular2-moment';
import { TableFooterComponent } from '../../common/table/table-footer/table-footer.component';
import { MockTranslateLoader } from '../../mocks/mock-translate-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckboxColumnComponent, ActionColumnComponent } from '../../components/table-columns';
import { CheckboxComponent } from '../../common/checkbox/checkbox.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'services/navbar.service';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';
import { CommonComponentsModule } from 'components/common-components.module';
import { PolicyStatusFmtPipe } from 'pipes/policy-status-fmt.pipe';

describe('NotificationsPageComponent', () => {
  let component: NotificationsPageComponent;
  let fixture: ComponentFixture<NotificationsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }),
        ReactiveFormsModule,
        RouterTestingModule,
        NgxDatatableModule,
        MomentModule,
        FormsModule,
        CommonComponentsModule
      ],
      declarations: [
        NotificationsPageComponent,
        NotificationsTableComponent,
        TableComponent,
        TableFooterComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        ActionColumnComponent,
        FmtTzPipe,
        PolicyStatusFmtPipe
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
