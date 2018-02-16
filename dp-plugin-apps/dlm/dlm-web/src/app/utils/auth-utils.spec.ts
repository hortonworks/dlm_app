/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { AuthUtils } from './auth-utils';
import { User } from 'models/user.model';

describe('Auth Utils', () => {
  const user = { username: 'username' } as User;

  describe('#setUser', () => {
    it('should set user info and update logged in status', () => {
      AuthUtils.setUser(user);
      expect(AuthUtils.getUser()).toEqual(user);
      expect(AuthUtils.isUserLoggedIn()).toBeTruthy();
    });
  });

  describe('#clearUser', () => {
    it('should clear user info', () => {
      AuthUtils.setUser(user);
      AuthUtils.clearUser();
      expect(AuthUtils.getUser()).toBeNull();
    });
  });

  describe('#isUserLoggedIn', () => {
    it('should return false by default when no user available', () => {
      expect(AuthUtils.isUserLoggedIn()).toBeFalsy();
    });

    it('should return true when user is set', () => {
      AuthUtils.setUser(user);
      expect(AuthUtils.isUserLoggedIn()).toBeTruthy();
    });
  });

});
