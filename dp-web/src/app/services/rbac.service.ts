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

import {Injectable} from '@angular/core';
import {IdentityService} from './identity.service';
import {Persona, PersonaTabs} from '../models/header-data';
import {Observable} from 'rxjs/Observable';
import {ConfigurationService} from './configuration.service';
import {Observer} from 'rxjs/Observer';
import {User} from '../models/user';
import {AuthenticationService} from './authentication.service';
import {AuthUtils} from '../shared/utils/auth-utils';

@Injectable()
export class RbacService {//role based access control

  private personaMap = new Map();
  private landingPageMap = new Map();

  constructor(private configService: ConfigurationService) {
    this.landingPageMap.set('SUPERADMIN', '/infra');
    this.landingPageMap.set('SUPERADMIN_ONBOARD', '/onboard/welcome');
    this.landingPageMap.set('CURATOR', '/datasteward/dataset');
    this.landingPageMap.set('INFRAADMIN', '/infra');
    this.landingPageMap.set('INFRAADMIN_ONBOARD', '/onboard');
  }

  get user() {
    return AuthUtils.getUser();
  }

  getActivePersona() {
    this.personaMap = this.getPersonaMap();
    if (this.hasRole('SUPERADMIN')) {
      return this.personaMap.get('SUPERADMIN');
    } else if (this.hasRole('INFRAADMIN')) {
      return this.personaMap.get('INFRAADMIN');
    } else if (this.hasRole('CURATOR')) {
      return this.personaMap.get('CURATOR');
    } else {
      return this.personaMap.get('SUPERADMIN');
    }
  }

  private getPersonaMap() {
    let personaMap = new Map();
    personaMap.set('SUPERADMIN', [
      new Persona('Dataplane Admin', [
        new PersonaTabs('Clusters', 'infra', 'fa-sitemap'),
        new PersonaTabs('Users', 'infra/usermgmt', 'fa-users'),
        new PersonaTabs('Services', 'infra/services', 'fa-arrows-h')
      ], ['/onboard', '/onboard/welcome', '/onboard/configure', '/onboard/adduser'], '', 'infra-logo.png')
    ]);
    personaMap.set('CURATOR', [
      new Persona('Data Steward Studio', [
        new PersonaTabs('Asset Collection', 'datasteward/dataset', 'fa-cubes', true),
        // new PersonaTabs('Unclassified', 'unclassified', 'fa-cube'),
        // new PersonaTabs('Assets', 'assets', 'fa-server'),
        // new PersonaTabs('Audits', 'audits', 'fa-sticky-note-o fa-sticky-note-search')
      ], ['/onboard', '/assets'], '', 'steward-logo.png', !!this.user && this.user.services.indexOf('dss') > -1)]);
    personaMap.set('INFRAADMIN', [
      new Persona('Infra Admin', [
        new PersonaTabs('Clusters', 'infra', 'fa-sitemap')
      ], [], '', 'infra-logo.png'),
      new Persona('Data Lifecycle Manager', [], [], '/dlm', 'dlm-logo.png', !!this.user && this.user.services.indexOf('dlm') > -1)]);
    personaMap.set('INFRAADMIN_SUPERADMIN', [
      new Persona('Data Lifecycle Manager', [], [], '/dlm', 'dlm-logo.png', !!this.user && this.user.services.indexOf('dlm') > -1)
    ]);
    return personaMap;
  }

  private getLandingInternal(observer: Observer<string>, key: String) {
    observer.next(this.landingPageMap.get(key));
    observer.complete();
  }

  getLandingPage(isLakeInitialized: boolean): Observable<string> {
    return Observable.create(observer => {
      if (!this.user.roles || this.user.roles.length === 0) {
        observer.next('/unauthorized');
        observer.complete();
        return;
      }
      if (this.hasRole('SUPERADMIN')) {
        this.configService.isKnoxConfigured().subscribe(response => {
          if (!response.configured) {
            return this.getLandingInternal(observer, 'SUPERADMIN_ONBOARD');
          }
          if (isLakeInitialized) {
            return this.getLandingInternal(observer, 'INFRAADMIN');
          } else {
            return this.getLandingInternal(observer, 'INFRAADMIN_ONBOARD');
          }
        });
      } else if (this.hasRole('INFRAADMIN')) {
        if (isLakeInitialized) {
          return this.getLandingInternal(observer, 'INFRAADMIN');
        } else {
          return this.getLandingInternal(observer, 'INFRAADMIN_ONBOARD');
        }
      } else if (this.hasRole('CURATOR')) {
        return this.getLandingInternal(observer, 'CURATOR');
      }
    });
  }

  private hasRole(userRole) {
    let roles = this.user.roles;
    return roles.find(role => role === userRole);
  }

  isAuthorized(route: string): boolean {
    let personas = this.getPersonaDetails();
    return this.isAuthorizedPersonaRoute(personas, route) || this.isAuthorizedNonPersonaRoute(personas, route);
  }

  isServiceEnabled(route: string): boolean {
    let personas = this.getPersonaDetails();
    return !personas.find(persona => !persona.enabled && !!persona.tabs.find(tab => route.startsWith(`/${tab.URL}`)));
  }

  private isAuthorizedPersonaRoute(personas, route: string): boolean {
    return !!personas.find(persona => !!persona.tabs.find(tab => route.startsWith(`/${tab.URL}`)));
  }

  private isAuthorizedNonPersonaRoute(personas, route: string): boolean {
    return !!personas.find(persona => !!persona.nonTabUrls.find(url => route.startsWith(`${url}`)));
  }

  getPersonaDetails() {
    let personas = [];
    this.personaMap = this.getPersonaMap();
    let isSuperAdmin = false;
    if (this.hasRole('SUPERADMIN')) {
      isSuperAdmin = true;
      personas.push(...this.personaMap.get('SUPERADMIN'));
    }
    if (this.hasRole('INFRAADMIN') && !isSuperAdmin) {
      personas.push(...this.personaMap.get('INFRAADMIN'));
    } else if (this.hasRole('INFRAADMIN') && isSuperAdmin) {
      personas.push(...this.personaMap.get('INFRAADMIN_SUPERADMIN'));
    }
    if (this.hasRole('CURATOR')) {
      personas.push(...this.personaMap.get('CURATOR'));
    }
    return personas;
  }
}
