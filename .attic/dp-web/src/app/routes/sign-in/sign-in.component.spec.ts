import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Environment } from '../../environment';

import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authenticationServiceStub: Object;
  let environmentStub: Object;
  let breadcrumbServiceStub: Object;

  beforeEach(async(() => {
    authenticationServiceStub = {};
    environmentStub = {};
    breadcrumbServiceStub = {};

    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [ SignInComponent ],
      providers: [
        {provide: AuthenticationService, useValue: authenticationServiceStub},
        {provide: Environment, useValue: environmentStub},
        {provide: BreadcrumbService, useValue: breadcrumbServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
