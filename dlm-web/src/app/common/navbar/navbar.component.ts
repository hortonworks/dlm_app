/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, Input, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavbarService } from 'services/navbar.service';
import { Persona } from 'models/header-data';
import { MenuItem } from './menu-item';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { DpAppNavigation } from 'dps-apps';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() menuItems: MenuItem[] = [];
  @Input() header: MenuItem;
  @Input() mainContentSelector = '#main';
  @Input() handlePopState = false;
  @Input() fitHeight = false;
  @Input() footer = 'footer';
  @Input() moveLeftContent = true;
  @Input() moveLeftFooter = true;
  @Input() menuLeftClass = 'glyphicon-menu-right';
  @Input() menuDownClass = 'glyphicon-menu-down';
  @Input() collapseNavBarClass = 'fa-angle-double-left';
  @Input() expandNavBarClass = 'fa-angle-double-right';
  @Input() activeClass = 'active';
  @Input() navBarToggleDataAttr = 'collapse-side-nav';
  @Input() subMenuNavToggleDataAttr = 'collapse-sub-menu';
  @Input() personas: Persona[];
  @ViewChild('personaNavSrc') personaNavSrc: ElementRef;

  navbar: any;
  options: any = {};

  isCollapsed = false;
  private navbarCollapse$: Observable<boolean>;
  private navbarCollapseSubscription: Subscription;

  constructor(navbar: ElementRef, private navbarService: NavbarService) {
    this.navbar = navbar.nativeElement;
    this.navbarCollapse$ = navbarService.isCollapsed;
    this.navbarCollapseSubscription = this.navbarCollapse$
      .subscribe(value => {
        // It returns true if not collapsed and false if collapsed
        this.isCollapsed = !value;
      });
  }

  ngOnInit() {
    this.options = {
      handlePopState: this.handlePopState,
      fitHeight: this.fitHeight,
      content: this.mainContentSelector,
      footer: this.footer,
      moveLeftContent: this.moveLeftContent,
      moveLeftFooter: this.moveLeftFooter,
      menuLeftClass: this.menuLeftClass,
      menuDownClass: this.menuDownClass,
      collapseNavBarClass: this.collapseNavBarClass,
      expandNavBarClass: this.expandNavBarClass,
      activeClass: this.activeClass,
      navBarToggleDataAttr: this.navBarToggleDataAttr,
      subMenuNavToggleDataAttr: this.subMenuNavToggleDataAttr
    };
  }

  ngAfterViewInit() {
    $(this.navbar)['navigationBar'](this.options);
    DpAppNavigation.init({
      srcElement: this.personaNavSrc.nativeElement,
      assetPrefix: 'assets/images'
    });
  }

  hasSubMenu(item: MenuItem): boolean {
    if (item.subMenu) {
      return item.subMenu.length > 0;
    }
    return false;
  }

  navigateToPersona(persona: Persona) {
    if (persona.url.length > 0) {
      window.location.pathname = persona.url;
    }
  }

  toggleNavbar() {
    this.navbarService.toggleNavbar();
  }
  ngOnDestroy() {
    if (this.navbarCollapseSubscription) {
      this.navbarCollapseSubscription.unsubscribe();
    }
  }

  /**
   * Navigation bar handles clicks itself and add class "active" on clicked item
   * External link should not have class "active", however NavBar doesn't allow ignore clicks for such links
   */
  restoreActiveItems() {
    const activeLink = $('.side-nav-menu .active');
    setTimeout(() => {
      $('.side-nav-menu .active').removeClass('active');
      activeLink.addClass('active');
    }, 50);
  }
}
