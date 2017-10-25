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

import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {MdlService} from './services/mdl.service';

import {User} from './models/user';
import {HeaderData} from './models/header-data';
import {CollapsibleNavService} from './services/collapsible-nav.service';
import {Loader, LoaderStatus} from './shared/utils/loader';
import {RbacService} from './services/rbac.service';
import {AuthUtils} from './shared/utils/auth-utils';

export enum ViewPaneState {
  MAXIMISE, MINIMISE
}

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {

  marginLeft = 0;
  viewPaneStates = ViewPaneState;
  viewPaneState = ViewPaneState.MAXIMISE;
  headerData: HeaderData = new HeaderData();
  showLoader: LoaderStatus;
  signOutUrl = AuthUtils.signoutURL;

  constructor(
              private titleService: Title,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private mdlService: MdlService,
              private translateService: TranslateService,
              private collapsibleNavService: CollapsibleNavService,
              private rbacService: RbacService,
              private cdRef: ChangeDetectorRef) {

    translateService.setTranslation('en', require('../assets/i18n/en.json'));
    translateService.setDefaultLang('en');
    translateService.use('en');

    router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        var titles = this.getTitles(router.routerState, router.routerState.root);
        if(titles.length > 0){
          titleService.setTitle(translateService.instant(`titles.${titles[titles.length - 1]}`));
        } else {
          titleService.setTitle(translateService.instant('titles.core'));
        }
      }
    });
  }

  isUserSignedIn() {
    return  AuthUtils.isUserLoggedIn();
  }

  getUser(): User {
    return AuthUtils.getUser();
  }

  isValidUser() {
    return AuthUtils.isValidUser();
  }

  ngOnInit() {
    AuthUtils.loggedIn$.subscribe(() => {
      this.setHeaderData();
    });

    if(this.isUserSignedIn()){
      this.setHeaderData();
    }

    this.collapsibleNavService.collpaseSideNav$.subscribe(collapsed => {
      this.viewPaneState = collapsed ? ViewPaneState.MINIMISE : ViewPaneState.MAXIMISE;
    });

    Loader.getStatus().subscribe(status => {
      this.showLoader = status
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  setHeaderData() {
    this.headerData = new HeaderData();
    this.headerData.personas = this.rbacService.getPersonaDetails();
  }

  getTitles(state, parent) {
    var data = [];
    if(parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if(state && parent) {
      data.push(...this.getTitles(state, state.firstChild(parent)));
    }
    return data;
  }
}
