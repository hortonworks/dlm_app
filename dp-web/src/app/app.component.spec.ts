/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

describe('App: Webapp', () => {
  let fixture: ComponentFixture<AppComponent>;
  let routerServiceStub: Object;
  let authServiceStub: Object;

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
      ],
      providers: [
        {provide: AuthenticationService, useValue: authServiceStub},
      ]
    });
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', async(() => {
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
