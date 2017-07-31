import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from '../../../../components/cluster-card/cluster-card.component';
import {PairingCardComponent} from './pairing-card.component';
import {Pairing} from 'models/pairing.model';
import {TooltipModule} from 'ng2-bootstrap';

describe('PairingCardComponent', () => {
  let component: PairingCardComponent;
  let fixture: ComponentFixture<PairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot()
      ],
      declarations: [PairingCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardComponent);
    component = fixture.componentInstance;
    component.pairing = <Pairing>{id: '1', pair: [{ location: {} }, { location: {} }]};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
