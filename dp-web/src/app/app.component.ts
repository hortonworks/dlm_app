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
        new PersonaTabs('DATASETS', 'dataset'),
        new PersonaTabs('UNCLASSIFIED', 'unclassified'),
        new PersonaTabs('ASSETS', 'assets'),
        new PersonaTabs('AUDITS', 'audits')
      ]),
      new Persona('Infra Admin', [
        new PersonaTabs('CLUSTERS', 'infra', 'fa-list')
      ], false),

      new Persona('Analytics', [
        new PersonaTabs('Workspace', 'workspace', 'fa-globe', [
          new PersonaTabs('Dashboard', 'workspaces/dashboard', 'fa-dashboard'),
          new PersonaTabs('Assets', 'workspaces/assets', 'fa-list-alt'),
          new PersonaTabs('Notebooks', 'workspaces/notebooks', 'fa-text-o'),
          new PersonaTabs('Jobs', 'workspaces/jobs', 'fa-briefcase')
        ]),
        new PersonaTabs('Assets', 'analytics/assets', 'fa-list-alt'),
        new PersonaTabs('Clusters', '', 'fa-database'),
        new PersonaTabs('Jobs', '', 'fa-briefcase')
      ], false),
      new Persona('DLM', [
      ], false)
    ];
  }
}
