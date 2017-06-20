import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import { IdentityService } from './services/identity.service';
import { MdlService } from './services/mdl.service';

import { User } from './models/user';
import {HeaderData, Persona, PersonaTabs} from './models/header-data';

export enum ViewPaneState {
  DEFAULT, MAXIMISE, MINIMISE
}

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  marginLeft = 0;
  personaTabs: PersonaTabs[];
  viewPaneStates = ViewPaneState;
  viewPaneState = ViewPaneState.DEFAULT;
  headerData: HeaderData = new HeaderData();

  constructor(
    private mdlService: MdlService,
    private identityService: IdentityService,
    private translateService: TranslateService
  ) {
    translateService.setTranslation('en', require('../assets/i18n/en.json'));
    translateService.setDefaultLang('en');
    translateService.use('en');
  }

  getUser(): User {
    return this.identityService.getUser();
  }

  isUserSignedIn(): boolean {
    return this.identityService.isUserAuthenticated();
  }

  ngOnInit() {
    this.setHeaderData();
  }

  setHeaderData() {
    this.headerData.personas = [
      new Persona('Data Steward', [
        new PersonaTabs('Dataset', 'dataset', 'fa-cubes'),
        new PersonaTabs('Unclassified', 'unclassified', 'fa-cube'),
        new PersonaTabs('Assets', 'assets', 'fa-server'),
        new PersonaTabs('Audits', 'audits', 'fa-sticky-note-o fa-sticky-note-search')
      ], '', 'steward-logo.png'),
      new Persona('Infra Admin', [
        new PersonaTabs('Clusters', 'infra', 'fa-sitemap')
      ], '', 'infra-logo.png'),
      new Persona('Analytics', [
        new PersonaTabs('Workspace', 'workspace', 'fa-globe'),
        new PersonaTabs('Assets', 'analytics/assets', 'fa-list-alt'),
        new PersonaTabs('Clusters', '', 'fa-database'),
        new PersonaTabs('Jobs', '', 'fa-briefcase')
      ], '', 'analytics-logo.png'),
      new Persona('Data Life cycle Manager', [], '/dlm', 'dlm-logo.png')
    ]
  }
}
