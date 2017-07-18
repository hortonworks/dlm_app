import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { NavbarService } from 'services/navbar.service';
import { MenuItem } from './menu-item';
import { PersonaPopupComponent } from 'common/persona-popup/persona-popup.component';
import { Persona } from 'models/header-data';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ NavbarComponent, PersonaPopupComponent ],
      providers: [ NavbarService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    component.header = new MenuItem('a', 'b', 'c');
    component.personas = [new Persona('admin', [], '', '')];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
