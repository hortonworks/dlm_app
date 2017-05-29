import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';

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
export class AppComponent implements OnInit, OnChanges {

  marginLeft = 0;
  persona: Persona;
  viewPaneStates = ViewPaneState;
  viewPaneState = ViewPaneState.DEFAULT;
  headerData: HeaderData = new HeaderData();

  constructor(
    private mdlService: MdlService,
    private identityService: IdentityService
  ) {}

  getUser(): User {
    return this.identityService.getUser();
  }

  isUserSignedIn(): boolean {
    return this.identityService.isUserAuthenticated();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['viewPaneState']) {
      this.setMainPaneLeftMargin();
    }
  }

  ngOnInit() {
    this.setHeaderData();
  }

  setHeaderData() {
    this.headerData.personas = [
      new Persona('Analyst', [
        new PersonaTabs('DATASETS', 'dataset'),
        new PersonaTabs('UNCLASSIFIED', 'unclassified'),
        new PersonaTabs('ASSETS', 'assets'),
        new PersonaTabs('AUDITS', 'audits')
      ]),
      new Persona('Infra Admin', [
        new PersonaTabs('CLUSTERS', 'infra')
      ], false),
      new Persona('DLM', [
      ], false)
    ];
  }

  setMainPaneLeftMargin() {
    if (this.viewPaneState === ViewPaneState.DEFAULT) {
      this.marginLeft = 0;
    } else if(this.viewPaneState === ViewPaneState.MAXIMISE) {
      this.marginLeft = 200;
    } else if(this.viewPaneState === ViewPaneState.MINIMISE) {
      this.marginLeft = 50;
    }
  }
}
