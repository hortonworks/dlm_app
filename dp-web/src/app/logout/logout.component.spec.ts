/* tslint:disable:no-unused-variable */
import { Router } from '@angular/router';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LogoutComponent } from './logout.component';
import { AuthenticationService } from '../services/authentication.service';


describe('Component: Logout', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let authenticationServiceStub: Object;
  let router: any;

  beforeEach(async(() => {
    router = {
      navigate: jasmine.createSpy('navigate')
    }
    authenticationServiceStub = {
      signOut: () => { jasmine.createSpy('signOut')}
    };
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        {provide: AuthenticationService, useValue: authenticationServiceStub},
        {provide: Router, useValue: router}
      ]
    });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
  }));

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to sign-in route', () => {
    expect(router.navigate).toHaveBeenCalledWith(['sign-in']);
  });
});
