import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { IdentityService } from './services/identity.service';
import { MdlService } from './services/mdl.service';

import { User } from './models/user';
import {HeaderData} from './models/header-data';

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
    this.headerData.tabs = [
      { 'tabName': 'DATASETS', 'URL': ''},
      { 'tabName': 'UNCLASSIFIED', 'URL': ''},
      { 'tabName': 'ASSETS', 'URL': ''},
      { 'tabName': 'AUDITS', 'URL': ''},
    ];

    this.headerData.personas = [
      { 'name': 'Infra Admin', 'URL': ''},
      { 'name': 'Analyst ', 'URL': ''},
      { 'name': 'DLM', 'URL': ''},
    ];

  }
}
