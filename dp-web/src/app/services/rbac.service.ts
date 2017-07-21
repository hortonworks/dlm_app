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
export class RbacService {

  private personaMap = new Map();
  private landingPageMap = new Map();
  private nonPersonaRoutesMap = new Map();

  constructor(private configService: ConfigurationService) {
    this.personaMap.set('SUPERADMIN', [
      new Persona('Admin', [
        new PersonaTabs('Clusters', 'infra', 'fa-sitemap'),
        new PersonaTabs('User Management', 'infra/users', 'fa-users')
      ], '', 'infra-logo.png')]);
    this.personaMap.set('CURATOR', [new Persona('Data Steward', [
      new PersonaTabs('Asset Collection', 'dataset', 'fa-cubes', true),
      new PersonaTabs('Unclassified', 'unclassified', 'fa-cube'),
      new PersonaTabs('Assets', 'assets', 'fa-server'),
      new PersonaTabs('Audits', 'audits', 'fa-sticky-note-o fa-sticky-note-search')
    ], '', 'steward-logo.png')]);
    this.personaMap.set('USER', [new Persona('Analytics', [
      new PersonaTabs('Workspace', 'workspace', 'fa-globe'),
      new PersonaTabs('Assets', 'analytics/assets', 'fa-list-alt'),
      new PersonaTabs('Clusters', '', 'fa-database'),
      new PersonaTabs('Jobs', '', 'fa-briefcase')
    ], '', 'analytics-logo.png')]);
    this.personaMap.set('INFRAADMIN', [new Persona('Cluster Admin', [
      new PersonaTabs('Clusters', 'infra', 'fa-sitemap')
    ], '', 'infra-logo.png'), new Persona('Data Life cycle Manager', [], '/dlm', 'dlm-logo.png')]);
    this.personaMap.set('INFRAADMIN_SUPERADMIN', [new Persona('DLM', [], '/dlm', 'dlm-logo.png')]);

    this.landingPageMap.set('SUPERADMIN', '/infra');
    this.landingPageMap.set('SUPERADMIN_ONBOARD', '/onboard/welcome');
    this.landingPageMap.set('CURATOR', '/dataset');
    this.landingPageMap.set('USER', '/workspace');
    this.landingPageMap.set('INFRAADMIN', '/infra');
    this.landingPageMap.set('INFRAADMIN_ONBOARD', '/onboard');

    this.nonPersonaRoutesMap.set('SUPERADMIN', ['/onboard', '/onboard/welcome', '/onboard/configure', '/onboard/adduser']);
    this.nonPersonaRoutesMap.set('INFRAADMIN', ['/onboard']);
    this.nonPersonaRoutesMap.set('CURATOR', []);
    this.nonPersonaRoutesMap.set('USER', []);

  }

  get user() {
    return AuthUtils.getUser();
  }

  private getLandingInternal(observer: Observer<string>, key: String) {
    observer.next(this.landingPageMap.get(key));
    observer.complete();
  }

  getLandingPage(isLakeInitialized: boolean): Observable<string> {
    return Observable.create(observer => {
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
      else if (this.hasRole('USER')) {
        return this.getLandingInternal(observer, 'USER');
      } else {
        return this.getLandingInternal(observer, '/');
      }
    });
  }

  private hasRole(userRole) {
    let roles = this.user.roles;
    return roles.find(role => role === userRole);
  }

  isAuthorized(route: string): boolean {
    return this.isAuthorizedPersonaRoute(route) || this.isAuthorizedNonPersonaRoute(route);
  }

  private isAuthorizedPersonaRoute(route: string): boolean {
    let authorized = false;
    let personas = this.getPersonaDetails();
    let tabs: PersonaTabs[] = [];
    personas.forEach(persona => {
      tabs.push(...persona.tabs);
    });
    for (let i = 0; i < tabs.length; i++) {
      let tab: PersonaTabs = tabs[i];
      if (route.startsWith(`/${tab.URL}`)) {
        authorized = true;
        break;
      }
    }
    return authorized;
  }

  private isAuthorizedNonPersonaRoute(route: string): boolean {
    let urls = [];
    if (this.hasRole('SUPERADMIN')) {
      urls.push(...this.nonPersonaRoutesMap.get('SUPERADMIN'));
    }
    if (this.hasRole('INFRAADMIN')) {
      urls.push(...this.nonPersonaRoutesMap.get('INFRAADMIN'));
    }
    if (this.hasRole('CURATOR')) {
      urls.push(...this.nonPersonaRoutesMap.get('CURATOR'));
    }
    if (this.hasRole('USER')) {
      urls.push(...this.nonPersonaRoutesMap.get('USER'));
    }
    return !!urls.find(url => url === route);
  }

  getPersonaDetails() {
    let personas = [];
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
    if (this.hasRole('USER')) {
      personas.push(...this.personaMap.get('USER'));
    }
    return personas;
  }
}
