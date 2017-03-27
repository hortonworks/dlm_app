import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthenticationService } from '../../services/authentication.service';
import { SidenavRouterLinkDirective } from './../../sidenav-router-link.directive';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authenticationServiceStub: Object;

  beforeEach(async(() => {
    authenticationServiceStub = {
      isAuthenticated: (): boolean => false
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ SidebarComponent, SidenavRouterLinkDirective ],
      providers: [
        {provide: AuthenticationService, useValue: authenticationServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
