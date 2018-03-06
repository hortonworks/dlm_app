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
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {DpAppNavigation} from 'dps-apps';
import {navigation} from '../../_nav';
import {DssAppEvents} from '../../services/dss-app-events';

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

  constructor(private router: Router,
              private dssAppEvents: DssAppEvents) {}

  ngOnInit() {
    DpAppNavigation.init({
        srcElement: this.personaNavSrc.nativeElement,
        assetPrefix: '/assets/images'
    });
    this.router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        this.setActiveNavFromBrowserLocation()
      }
    });
  }

  setActiveNavFromBrowserLocation() {
    const items = JSON.parse(JSON.stringify(this.navItems));
    const currentURL = window.location.pathname;
    for (let i = 0; i < items.length; i++) {
      const nav = items[i];
      if (nav.children && nav.children.length > 0) {
        items.push(...nav.children);
      }
      if (nav.url === currentURL) {
        this.activeTabName = nav.name;
        break;
      }
    }
  }

  toggleNav() {
    this.collapseSideNav = !this.collapseSideNav;
    setTimeout(() => this.dssAppEvents.setSideNavCollapsed(this.collapseSideNav), 300);
  }

  onSideNavClick($event, nav) {
    $event.stopPropagation();

    if (nav.children && nav.children.length > 0) {
      if (!this.collapseSideNav) {
        nav.hidden = !nav.hidden;
      }
      return;
    }

    this.activeTabName = nav.name;
    this.router.navigateByUrl(nav.url);

    return false;
  }

  onSideNavMouseEnter(nav, children) {
    let childMenu = children.getElementsByClassName('sidenav-item-children')[0];
    if (this.collapseSideNav && childMenu) {
      childMenu.classList.add('active');
    }
  }

  onSideNavMouseLeave(nav, children) {
    let childMenu = children.getElementsByClassName('sidenav-item-children')[0];
    if (this.collapseSideNav && childMenu) {
      childMenu.classList.remove('active');
    }

  }
}
