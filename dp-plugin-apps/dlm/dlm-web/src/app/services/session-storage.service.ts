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
