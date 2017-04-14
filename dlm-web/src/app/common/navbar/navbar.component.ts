import { Component, Input, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { MenuItem } from './menu-item';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, AfterViewInit {

  @Input() menuItems: MenuItem[] = [];
  @Input() header: MenuItem;
  @Input() mainContentSelector = '#main';
  @Input() handlePopState = true;
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

  navbar: any;
  options: any = {};
  constructor(navbar: ElementRef) {
    this.navbar = navbar.nativeElement;
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
  }

  hasSubMenu(item: MenuItem): boolean {
    if (item.subMenu) {
      return item.subMenu.length > 0;
    }
    return false;
  }
}
