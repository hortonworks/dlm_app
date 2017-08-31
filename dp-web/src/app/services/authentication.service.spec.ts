/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
