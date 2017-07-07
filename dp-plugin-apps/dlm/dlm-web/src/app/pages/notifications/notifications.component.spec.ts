import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationsPageComponent } from './notifications.component';
import { NotificationsTableComponent } from './notifications-table/notifications-table.component';
import { TableComponent } from 'common/table/table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MockStore } from 'mocks/mock-store';
import { Store } from '@ngrx/store';
import { MomentModule } from 'angular2-moment';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components/table-columns';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'services/navbar.service';
import { PipesModule } from 'pipes/pipes.module';
import { CommonComponentsModule } from 'components/common-components.module';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { ModalModule } from 'ng2-bootstrap';
import { ModalDialogBodyComponent } from 'common/modal-dialog/modal-dialog-body.component';
import { LogModalDialogComponent } from 'components/log-modal-dialog/log-modal-dialog.component';

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
        ModalModule.forRoot(),
        MomentModule,
        FormsModule,
        CommonComponentsModule,
        PipesModule
      ],
      declarations: [
        NotificationsPageComponent,
        NotificationsTableComponent,
        TableComponent,
        TableFooterComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        ActionColumnComponent,
        ModalDialogComponent,
        ModalDialogBodyComponent,
        LogModalDialogComponent
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
