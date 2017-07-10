import {Component, OnDestroy, OnInit} from '@angular/core';
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

export enum ViewPaneState {
  MAXIMISE, MINIMISE
}

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  marginLeft = 0;
  viewPaneStates = ViewPaneState;
  viewPaneState = ViewPaneState.MAXIMISE;
  headerData: HeaderData = new HeaderData();
  showLoader: LoaderStatus;

  constructor(private mdlService: MdlService,
              private identityService: IdentityService,
              private translateService: TranslateService,
              private collapsibleNavService: CollapsibleNavService,
              private rbacService: RbacService,
              private authenticationService: AuthenticationService,
              private router: Router) {
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
    this.authenticationService.userAuthenticated$.subscribe(() => {
      this.setHeaderData();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.isUserSignedIn()) {
        this.setHeaderData();
      }
    });

    this.collapsibleNavService.collpaseSideNav$.subscribe(collapsed => {
      this.viewPaneState = collapsed ? ViewPaneState.MINIMISE : ViewPaneState.MAXIMISE;
    });
    Loader.getStatus().subscribe(status => {
      this.showLoader = status
    });
  }

  ngOnDestroy() {
    this.headerData = new HeaderData();
  }


  setHeaderData() {
    this.headerData.personas = this.rbacService.getPersonaDetails();
  }
}
