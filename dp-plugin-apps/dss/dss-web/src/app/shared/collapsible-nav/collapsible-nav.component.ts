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

import {Component, ViewChild, ElementRef, OnInit, HostBinding, isDevMode} from '@angular/core';
import {Router} from '@angular/router';
import {DpAppNavigation} from 'dps-apps';
import {navigation} from '../../_nav';

@Component({
  selector: 'dss-collapsible-nav',
  templateUrl: './collapsible-nav.component.html',
  styleUrls: ['./collapsible-nav.component.scss']
})
export class CollapsibleNavComponent implements OnInit {
  activeTabName: string = '';
  navItems = navigation;
  assetPrefix = isDevMode() ? '' : 'dss';
  dssLogoPath = `${this.assetPrefix}/assets/images/dss-logo-white.png`;

  @ViewChild('personaNavSrc') personaNavSrc: ElementRef;
  @HostBinding('class.dss-sidebar-collapsed') collapseSideNav = false;

  constructor(private router: Router) {}

  ngOnInit() {
    DpAppNavigation.init({
        srcElement: this.personaNavSrc.nativeElement,
        assetPrefix: '/assets/images'
    });
  }

  toggleNav() {
    this.collapseSideNav = !this.collapseSideNav;
  }

  navigateToURL(nav) {
    this.router.navigateByUrl(nav.url);
  }
}
