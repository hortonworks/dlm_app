import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ClusterCardComponent} from '../../../../components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from '../create-pairing-card/create-pairing-card.component';
import { CreatePairingCardListComponent } from './create-pairing-card-list.component';

describe('CreatePairingCardListComponent', () => {
  let component: CreatePairingCardListComponent;
  let fixture: ComponentFixture<CreatePairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePairingCardListComponent, CreatePairingCardComponent, ClusterCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
