import { Component, Input, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NavbarService } from 'services/navbar.service';
import { Persona } from 'models/header-data';
import { MenuItem } from './menu-item';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  @Input() personas: Persona[];
  @ViewChild('personaNavSrc') personaNavSrc: ElementRef;
  personaNavSrcNativeElement;

  navbar: any;
  options: any = {};
  constructor(navbar: ElementRef,
              private navbarService: NavbarService) {
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
}
