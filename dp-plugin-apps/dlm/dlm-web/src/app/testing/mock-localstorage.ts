/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const mockLocalStorage = (initial = {}) => {
  let store = initial;

  spyOn(localStorage, 'getItem').and.callFake((key: string): string => {
   return store[key] || null;
  });
  spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
    delete store[key];
  });
  spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => {
    return store[key] = <string>value;
  });
  spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
  });
};
