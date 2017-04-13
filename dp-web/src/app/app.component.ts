import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { IdentityService } from './services/identity.service';
import { MdlService } from './services/mdl.service';

import { User } from './models/user';

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('layout') layout: ElementRef;

  constructor(
    private router: Router,
    private mdlService: MdlService,
    private identityService: IdentityService,
  ) {}

  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe(() => this.mdlService.closeDrawer(this.layout));
  }

  isUserSignedIn(): boolean {
    return this.identityService.isUserAuthenticated();
  }

  getUser(): User {
    return this.identityService.getUser();
  }
}
