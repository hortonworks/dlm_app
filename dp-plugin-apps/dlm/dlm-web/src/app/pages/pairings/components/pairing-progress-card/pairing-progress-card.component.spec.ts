import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from 'components/cluster-card/cluster-card.component';
import {PairingProgressCardComponent} from './pairing-progress-card.component';
import {Cluster} from 'models/cluster.model';
import {TooltipModule} from 'ng2-bootstrap';

describe('PairingProgressCardComponent', () => {
  let component: PairingProgressCardComponent;
  let fixture: ComponentFixture<PairingProgressCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot()],
      declarations: [PairingProgressCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingProgressCardComponent);
    component = fixture.componentInstance;
    component.firstCluster = <Cluster>{location: {}};
    component.secondCluster = <Cluster>{location: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
