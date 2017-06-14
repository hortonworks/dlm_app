import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {PairingsComponent} from './pairings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {PairingCardListComponent} from './components/pairing-card-list/pairing-card-list.component';
import {PairingCardComponent} from './components/pairing-card/pairing-card.component';
import {ModalDialogComponent} from '../../common/modal-dialog/modal-dialog.component';
import {MockStore} from '../../mocks/mock-store';
import {ModalModule} from 'ng2-bootstrap';
import {Store} from '@ngrx/store';
import { CommonComponentsModule } from 'components/common-components.module';
import { PolicyStatusFmtPipe } from 'pipes/policy-status-fmt.pipe';

describe('PairingsComponent', () => {
  let component: PairingsComponent;
  let fixture: ComponentFixture<PairingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        RouterTestingModule,
        ModalModule.forRoot(),
        CommonComponentsModule
      ],
      declarations: [
        PairingsComponent,
        PairingCardComponent,
        PairingCardListComponent,
        ModalDialogComponent,
        PolicyStatusFmtPipe
      ],
      providers: [
        {provide: Store, useClass: MockStore}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
