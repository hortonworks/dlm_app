import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PairingCardComponent} from '../pairing-card/pairing-card.component';
import {PairingCardListComponent} from './pairing-card-list.component';
import {ClusterCardComponent} from 'components/cluster-card/cluster-card.component';
import {TooltipModule} from 'ng2-bootstrap';

describe('PairingCardListComponent', () => {
  let component: PairingCardListComponent;
  let fixture: ComponentFixture<PairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot()
      ],
      declarations: [PairingCardListComponent, PairingCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
