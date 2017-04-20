import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CreatePairingComponent} from './create-pairing.component';
import {PairingCardListComponent} from '../pairing-card-list/pairing-card-list.component';
import {PairingProgressCardComponent} from '../pairing-progress-card/pairing-progress-card.component';
import {PairingCardComponent} from '../pairing-card/pairing-card.component';
import {ClusterCardComponent} from '../../../components/cluster-card/cluster-card.component';
import {MockStore} from '../../../mocks/mock-store';
import {Store} from '@ngrx/store';
import {MockTranslateLoader} from '../../../mocks/mock-translate-loader';

describe('CreatePairingComponent', () => {
  let component: CreatePairingComponent;
  let fixture: ComponentFixture<CreatePairingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), ReactiveFormsModule],
      declarations: [
        CreatePairingComponent,
        PairingCardListComponent,
        PairingProgressCardComponent,
        PairingCardComponent,
        ClusterCardComponent
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
