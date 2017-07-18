import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { User } from 'models/user.model';

@Injectable()
export class IdentityService {

  constructor(private http: Http) {}

  isUserAuthenticated() {
    return !!localStorage.getItem('dp_user');
  }

  getUser() {
    return <User> JSON.parse(localStorage.getItem('dp_user'));
  }

}
