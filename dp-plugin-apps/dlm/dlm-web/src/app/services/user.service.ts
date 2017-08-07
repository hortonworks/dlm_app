/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Injectable, isDevMode} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { getHeaders, mapResponse } from 'utils/http-util';
import {User} from 'models/user.model';
import {Persona} from 'models/header-data';
import {AuthUtils} from 'utils/auth-utils';
import {ROLES} from 'constants/user.constant';

@Injectable()
export class UserService {

  static signoutURL = '/auth/signOut';
  private personaMap = new Map();
  private ROLES = ROLES;

  constructor(private http: Http) {
    this.personaMap.set(this.ROLES.SUPERADMIN, [new Persona('Admin', [], '/infra', 'infra-logo.png')]);
    this.personaMap.set(this.ROLES.CURATOR, [new Persona('Data Steward', [], '/dataset', 'steward-logo.png')]);
    this.personaMap.set(this.ROLES.USER, [new Persona('Analytics', [], '/workspace', 'analytics-logo.png')]);
    this.personaMap.set(this.ROLES.INFRAADMIN, [new Persona('Cluster Admin', [], '/infra', 'infra-logo.png'),
      new Persona('Data Lifecycle Manager', [], '', 'dlm-logo.png', true)]);
    this.personaMap.set(this.ROLES.INFRAADMIN_SUPERADMIN, [new Persona('Data Lifecycle Manager', [], '', 'dlm-logo.png', true)]);
  }

  get user() {
    return AuthUtils.getUser();
  }

  getUserDetail(): Observable<User> {
    // Access Dataplane API directly to get user details
    const urlPrefix = this.getUrlPrefix();
    // Do not make a request in Dev mode
    if (!isDevMode()) {
      return mapResponse(this.http.get(urlPrefix + '/auth/userDetail', new RequestOptions(getHeaders())));
    }
    return Observable.of(<User>{});
  }

  logoutUser() {
    // Access Dataplane API directly to log the user out
    window.location.pathname = UserService.signoutURL;
  }

  /**
   * Get absolute URL prefix required to access Dataplane API
   * @returns {string}
   */
  getUrlPrefix(): string {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    let port = window.location.port;
    port = port ? ':' + port : '';
    return protocol + '//' + host + port;
  }

  private hasRole(userRole) {
    const roles = this.user.roles;
    return roles && roles.find(role => role === userRole);
  }

  getPersonaDetails() {
    const personas = [];
    let isSuperAdmin = false;
    if (this.hasRole(this.ROLES.SUPERADMIN)) {
      isSuperAdmin = true;
      personas.push(...this.personaMap.get(this.ROLES.SUPERADMIN));
    }
    if (this.hasRole(this.ROLES.INFRAADMIN) && !isSuperAdmin) {
      personas.push(...this.personaMap.get(this.ROLES.INFRAADMIN));
    } else if (this.hasRole(this.ROLES.INFRAADMIN) && isSuperAdmin) {
      personas.push(...this.personaMap.get(this.ROLES.INFRAADMIN_SUPERADMIN));
    }
    if (this.hasRole(this.ROLES.CURATOR)) {
      personas.push(...this.personaMap.get(this.ROLES.CURATOR));
    }
    if (this.hasRole(this.ROLES.USER)) {
      personas.push(...this.personaMap.get(this.ROLES.USER));
    }
    return personas;
  }
}
