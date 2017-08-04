/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class SessionStorageService {
  constructor() { }

  get(key: string): any {
    const item = localStorage.getItem(key);
    try {
      return JSON.parse(item);
    } catch (e) {
      return item;
    }
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  delete(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
