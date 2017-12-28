/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable, isDevMode } from '@angular/core';
import { RequestOptions } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { getHeaders } from 'utils/http-util';
import { User } from 'models/user.model';
import { Persona } from 'models/header-data';
import { AuthUtils } from 'utils/auth-utils';
import { ROLES } from 'constants/user.constant';

@Injectable()
export class UserService {

  static HEADER_CHALLENGE_HREF = 'X-Authenticate-Href';
  static signoutURL = '/auth/out';

  private personaMap = new Map();
  private ROLES = ROLES;

  constructor(private httpClient: HttpClient) {
  }

  get user(): User {
    return AuthUtils.getUser();
  }

  getPersonaMap() {
    const personaMap = new Map();
    personaMap.set(this.ROLES.SUPERADMIN, [new Persona('DataPlane Admin', [], '/infra', 'infra-logo-white.png')]);
    personaMap.set(this.ROLES.CURATOR, [
      new Persona('Data Steward', [], '/datasteward/collections', 'steward-logo.png',
        !!this.user && this.user.services.indexOf('dss') > -1, false)
    ]);
    personaMap.set(this.ROLES.USER, [new Persona('Analytics', [], '/workspace', 'analytics-logo.png')]);
    personaMap.set(this.ROLES.INFRAADMIN, [
      new Persona('Cluster Admin', [], '/infra', 'infra-logo-white.png'),
      new Persona('Data Lifecycle Manager', [], '', 'dlm-logo.png', true, true)
    ]);
    personaMap.set(this.ROLES.INFRAADMIN_SUPERADMIN, [new Persona('Data Lifecycle Manager', [], '', 'dlm-logo.png', true, true)]);
    return personaMap;
  }

  getUserDetail(): Observable<User> {
    // Access Dataplane API directly to get user details
    const urlPrefix = this.getUrlPrefix();
    // Do not make a request in Dev mode
    if (!isDevMode()) {
      return this.httpClient.get<any>(urlPrefix + '/api/identity', { headers: getHeaders() });
    }
    // Get mock response
    return this.httpClient.get<any>('api/identity');
  }

  logoutUser() {
    // Access Dataplane API directly to log the user out
    const urlPrefix = this.getUrlPrefix();
    return this.httpClient
      .get<any>(urlPrefix + UserService.signoutURL)
      .subscribe(response => {
        const challengeAt = response.headers.get(UserService.HEADER_CHALLENGE_HREF);
        window.location.href = `${window.location.protocol}//${window.location.host}/${challengeAt}?originalUrl=${window.location.href}`;
      });
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
    this.personaMap = this.getPersonaMap();
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
