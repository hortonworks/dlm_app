import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClusterCardComponent } from '../../../../components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from './create-pairing-card.component';
import { Cluster } from '../../../../models/cluster.model';

describe('CreatePairingCardComponent', () => {
  let component: CreatePairingCardComponent;
  let fixture: ComponentFixture<CreatePairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePairingCardComponent, ClusterCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{clusterDetails: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
