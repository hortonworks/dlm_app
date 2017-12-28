/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { TestBed, getTestBed } from '@angular/core/testing';

import { mockLocalStorage } from 'testing/mock-localstorage';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  let injector: TestBed;
  let sessionStorageService: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionStorageService]
    });

    mockLocalStorage({b: '1'});

    injector = getTestBed();
    sessionStorageService = injector.get(SessionStorageService);
  });

  describe('#get', () => {
    it('should return value 1 by key "b"', () => {
      expect(sessionStorageService.get('b')).toBe(1);
    });
  });

  describe('#set', () => {
    it('should set key "a" with value "b" to storage', () => {
      sessionStorageService.set('a', 'b');
      expect(sessionStorageService.get('a')).toBe('b');
    });
  });

  describe('#delete', () => {
    it('should delete item by key "a"', () => {
      sessionStorageService.set('a', 'b');
      sessionStorageService.delete('a');
      expect(sessionStorageService.get('a')).toBe(null);
    });
  });

  describe('#clear', () => {
    it('should clear storage from items', () => {
      sessionStorageService.clear();
      expect(sessionStorageService.get('b')).toBe(null);
    });
  });
});
