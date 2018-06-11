/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
import { OverlayService } from 'services/overlay.service';

@Injectable()
export class UserService {

  static HEADER_CHALLENGE_HREF = 'X-Authenticate-Href';
  static signoutURL = '/auth/out';

  private personaMap = new Map();
  private ROLES = ROLES;

  constructor(private httpClient: HttpClient, private overlayService: OverlayService) {
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
    this.overlayService.showLoadingOverlay();
    return this.httpClient
      .get<any>(urlPrefix + UserService.signoutURL)
      .subscribe(response => {
        const challengeAt = response.headers.get(UserService.HEADER_CHALLENGE_HREF);
        const dpEndpoint = `${window.location.protocol}//${window.location.host}/`;
        const redirectTo = `${dpEndpoint}${challengeAt}`;
        window.location.href = `${redirectTo}?originalUrl=${dpEndpoint}`;
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
