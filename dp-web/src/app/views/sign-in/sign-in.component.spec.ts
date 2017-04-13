import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';

import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authenticationServiceStub: Object;

  beforeEach(async(() => {
    authenticationServiceStub = {};

    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [ SignInComponent ],
      providers: [
        {provide: AuthenticationService, useValue: authenticationServiceStub},
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
