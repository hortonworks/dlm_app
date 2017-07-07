import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreatePairingComponent } from './create-pairing.component';
import { CreatePairingCardListComponent } from 'pages/pairings/components/create-pairing-card-list/create-pairing-card-list.component';
import { PairingProgressCardComponent } from 'pages/pairings/components/pairing-progress-card/pairing-progress-card.component';
import { CreatePairingCardComponent } from 'pages/pairings/components/create-pairing-card/create-pairing-card.component';
import { MockStore } from 'mocks/mock-store';
import { Store } from '@ngrx/store';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { ModalModule } from 'ng2-bootstrap';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TooltipModule } from 'ng2-bootstrap';
import { CommonComponentsModule } from 'components/common-components.module';
import { NotificationService } from 'services/notification.service';

describe('CreatePairingComponent', () => {
  let component: CreatePairingComponent;
  let fixture: ComponentFixture<CreatePairingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }),
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterTestingModule,
        TooltipModule.forRoot(),
        CommonComponentsModule
      ],
      declarations: [
        CreatePairingComponent,
        CreatePairingCardListComponent,
        PairingProgressCardComponent,
        CreatePairingCardComponent,
        ModalDialogComponent,
        BytesSizePipe
      ],
      providers: [
        {
          provide: Store,
          useClass: MockStore
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
