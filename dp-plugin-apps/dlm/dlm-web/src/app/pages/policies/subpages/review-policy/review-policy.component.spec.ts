import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {MockStore} from 'mocks/mock-store';
import { CommonComponentsModule } from 'components/common-components.module';
import {ReviewPolicyComponent} from './review-policy.component';
import {NavbarService} from 'services/navbar.service';
import { RouterTestingModule } from '@angular/router/testing';
import {MockTimeZoneService} from 'mocks/mock-timezone';
import {TimeZoneService} from 'services/time-zone.service';
import { PipesModule } from 'pipes/pipes.module';
import {FrequencyPipe} from 'pipes/frequency.pipe';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { ModalDialogBodyComponent } from 'common/modal-dialog/modal-dialog-body.component';
import { ModalModule } from 'ng2-bootstrap';

describe('ReviewPolicyComponent', () => {
  let component: ReviewPolicyComponent;
  let fixture: ComponentFixture<ReviewPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        ModalModule.forRoot(),
        CommonComponentsModule,
        RouterTestingModule,
        PipesModule
      ],
      declarations: [
        ReviewPolicyComponent,
        ModalDialogComponent,
        ModalDialogBodyComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {provide: TimeZoneService, useClass: MockTimeZoneService},
        NavbarService,
        FrequencyPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
