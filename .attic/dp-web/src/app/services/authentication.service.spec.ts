import { HttpModule } from '@angular/http';
import { TestBed, inject } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [AuthenticationService]
    });
  });

  beforeEach(inject([AuthenticationService], s => {
    service = s;
  }));

  describe('#isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      service.isUserAuthenticated = true;
      expect(service.isAuthenticated()).toBeTruthy();
    });
  });

  describe('#signOut', () => {
    it('should sign out the user', () => {
      service.isUserAuthenticated = true;
      service.signOut();
      expect(service.isAuthenticated()).toBeFalsy();
    });
  });
});
