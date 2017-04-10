import { Component, Input, ElementRef } from '@angular/core';

import { MenuItem } from './menu-item';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {

  @Input() menuItems: MenuItem[] = [];
  @Input() header: MenuItem;
  @Input() mainContentSelector: string = '#main';
  @Input() handlePopState: boolean = true;
  @Input() fitHeight: boolean = false;
  @Input() footer: string = 'footer';
  @Input() moveLeftContent: boolean = true;
  @Input() moveLeftFooter: boolean = true;
  @Input() menuLeftClass: string = 'glyphicon-menu-right';
  @Input() menuDownClass: string ='glyphicon-menu-down';
  @Input() collapseNavBarClass: string = 'fa-angle-double-left';
  @Input() expandNavBarClass: string = 'fa-angle-double-right';
  @Input() activeClass: string = 'active';
  @Input() navBarToggleDataAttr: string = 'collapse-side-nav';
  @Input() subMenuNavToggleDataAttr: string = 'collapse-sub-menu';

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
    console.log(this.options);
  }

  hasSubMenu(item: MenuItem): boolean {
    return item.subMenu.length > 0;
  }
}
