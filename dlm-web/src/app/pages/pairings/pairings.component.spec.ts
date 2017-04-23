import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {PairingsComponent} from './pairings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';
import {PairingCardListComponent} from './components/pairing-card-list/pairing-card-list.component';
import {PairingCardComponent} from './components/pairing-card/pairing-card.component';
import {ClusterCardComponent} from '../../components/cluster-card/cluster-card.component';
import {MockStore} from '../../mocks/mock-store';
import {Store} from '@ngrx/store';

describe('PairingsComponent', () => {
  let component: PairingsComponent;
  let fixture: ComponentFixture<PairingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), RouterTestingModule],
      declarations: [
        PairingsComponent,
        PairingCardComponent,
        PairingCardListComponent,
        ClusterCardComponent
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
