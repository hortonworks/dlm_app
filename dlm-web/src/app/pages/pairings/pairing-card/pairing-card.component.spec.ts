import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from '../../../components/cluster-card/cluster-card.component';
import {PairingCardComponent} from './pairing-card.component';
import {Cluster} from '../../../models/cluster.model';

describe('PairingCardComponent', () => {
  let component: PairingCardComponent;
  let fixture: ComponentFixture<PairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PairingCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{clusterDetails: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
