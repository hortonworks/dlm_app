import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { IdentityService } from './services/identity.service';
import { MdlService } from './services/mdl.service';

import { User } from './models/user';
import {HeaderData, Persona, PersonaTabs} from './models/header-data';

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('layout') layout: ElementRef;
  headerData: HeaderData = new HeaderData();

  constructor(
    private router: Router,
    private mdlService: MdlService,
    private identityService: IdentityService
  ) {}

  getUser(): User {
    return this.identityService.getUser();
  }

  isUserSignedIn(): boolean {
    return this.identityService.isUserAuthenticated();
  }

  ngOnInit() {
    this.setHeaderData();
    this.router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe(() => this.mdlService.closeDrawer(this.layout));
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
        new PersonaTabs('DATA LAKES', 'infra')
      ]),
      new Persona('DLM', [
      ])
    ];
  }
}
