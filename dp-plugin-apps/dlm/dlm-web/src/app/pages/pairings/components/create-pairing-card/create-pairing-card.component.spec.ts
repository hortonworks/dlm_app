import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClusterCardComponent } from 'components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from './create-pairing-card.component';
import { Cluster } from 'models/cluster.model';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TooltipModule } from 'ng2-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';

describe('CreatePairingCardComponent', () => {
  let component: CreatePairingCardComponent;
  let fixture: ComponentFixture<CreatePairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot(), TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      })],
      declarations: [CreatePairingCardComponent, ClusterCardComponent, BytesSizePipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{
      id: '1',
      location: {},
      stats: {CapacityUsed: 1, CapacityRemaining: 4, CapacityTotal: 5}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
