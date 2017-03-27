/* tslint:disable:no-unused-variable */

import { SidenavRouterLinkDirective } from './sidenav-router-link.directive';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { Environment } from './environment';

describe('App: Webapp', () => {
  let fixture: ComponentFixture<AppComponent>;
  let routerServiceStub: Object;
  let authServiceStub: Object;
  let environmentServiceStub: Object;

  beforeEach(() => {
    authServiceStub = {};
    routerServiceStub = {};
    authServiceStub = {};

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent,
        SidenavRouterLinkDirective
      ],
      providers: [
        {provide: AuthenticationService, useValue: authServiceStub},
        {provide: Environment, useValue: environmentServiceStub}
      ]
    });
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', async(() => {
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
