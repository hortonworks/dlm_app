import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClusterCardComponent } from '../../../../components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from './create-pairing-card.component';
import { Cluster } from '../../../../models/cluster.model';
import {BytesSizePipe} from '../../../../pipes/bytes-size.pipe';

describe('CreatePairingCardComponent', () => {
  let component: CreatePairingCardComponent;
  let fixture: ComponentFixture<CreatePairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePairingCardComponent, ClusterCardComponent, BytesSizePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{id: '1', location: {}, stats: { CapacityUsed: 1, CapacityRemaining: 4, CapacityTotal: 5 }};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
