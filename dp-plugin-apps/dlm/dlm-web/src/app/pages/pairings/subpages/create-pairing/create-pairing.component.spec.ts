import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CreatePairingComponent} from './create-pairing.component';
import {CreatePairingCardListComponent} from '../../components/create-pairing-card-list/create-pairing-card-list.component';
import {PairingProgressCardComponent} from '../../components/pairing-progress-card/pairing-progress-card.component';
import {CreatePairingCardComponent} from '../../components/create-pairing-card/create-pairing-card.component';
import {ClusterCardComponent} from '../../../../components/cluster-card/cluster-card.component';
import {MockStore} from '../../../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {ModalDialogComponent} from '../../../../common/modal-dialog/modal-dialog.component';
import {ModalModule} from 'ng2-bootstrap';
import {MockTranslateLoader} from '../../../../mocks/mock-translate-loader';
import {RouterTestingModule} from '@angular/router/testing';

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
        RouterTestingModule
      ],
      declarations: [
        CreatePairingComponent,
        CreatePairingCardListComponent,
        PairingProgressCardComponent,
        CreatePairingCardComponent,
        ClusterCardComponent,
        ModalDialogComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore}
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
