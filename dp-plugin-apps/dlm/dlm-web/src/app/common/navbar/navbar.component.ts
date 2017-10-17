/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavbarService } from 'services/navbar.service';
import { RouterLinkActive } from '@angular/router';
import { Persona } from 'models/header-data';
import { MenuItem } from './menu-item';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

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
  personaNavSrcNativeElement;

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
    $(this.navbar).navigationBar(this.options);
    this.personaNavSrcNativeElement = this.personaNavSrc.nativeElement;
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
