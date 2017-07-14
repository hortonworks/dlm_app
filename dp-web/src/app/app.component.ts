import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {IdentityService} from './services/identity.service';
import {MdlService} from './services/mdl.service';

import {User} from './models/user';
import {HeaderData, Persona, PersonaTabs} from './models/header-data';
import {CollapsibleNavService} from './services/collapsible-nav.service';
import {Loader, LoaderStatus} from './shared/utils/loader';
import {RbacService} from './services/rbac.service';
import {AuthenticationService} from './services/authentication.service';
import {NavigationStart, Router} from '@angular/router';
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
 user: User;
  isUserSignedIn = false;

  constructor(private mdlService: MdlService,
              private identityService: IdentityService,
              private translateService: TranslateService,
              private collapsibleNavService: CollapsibleNavService,
              private rbacService: RbacService,
              private authenticationService: AuthenticationService,
              private cdRef: ChangeDetectorRef) {
    translateService.setTranslation('en', require('../assets/i18n/en.json'));
    translateService.setDefaultLang('en');
    translateService.use('en');
  }

  ngOnInit() {
    this.authenticationService.userAuthenticated$.subscribe(() => {
      this.isUserSignedIn = true;
      this.setHeaderData();
      this.user = AuthUtils.getUser();
    });

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
}
