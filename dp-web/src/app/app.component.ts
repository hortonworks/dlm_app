import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, DoCheck, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {IdentityService} from './services/identity.service';
import {MdlService} from './services/mdl.service';

import {User} from './models/user';
import {HeaderData, Persona, PersonaTabs} from './models/header-data';
import {CollapsibleNavService} from './services/collapsible-nav.service';
import {Loader, LoaderStatus} from './shared/utils/loader';
import {RbacService} from './services/rbac.service';
import {AuthenticationService} from './services/authentication.service';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
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
              private router: Router,
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
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAuthenticated();
        this.collapsibleNavService.collpaseSideNav.next(this.viewPaneState === ViewPaneState.MINIMISE ? false : true);
      }
    });
    this.isAuthenticated();
    this.collapsibleNavService.collpaseSideNav$.subscribe(collapsed => {
      this.viewPaneState = collapsed ? ViewPaneState.MINIMISE : ViewPaneState.MAXIMISE;
    });

    Loader.getStatus().subscribe(status => {
      this.showLoader = status
    });
  }

  isAuthenticated() {
    this.authenticationService.isAuthenticated().subscribe((isAuthenticated) => {
      this.isUserSignedIn = isAuthenticated;
      if (isAuthenticated) {
        this.user = AuthUtils.getUser();
        this.setHeaderData();
      }
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
