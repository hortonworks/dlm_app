import {Component, Input, ElementRef, ViewChild, HostListener, Output, EventEmitter, OnInit} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import {User} from '../../models/user';
import {HeaderData, Persona, PersonaTabs} from '../../models/header-data';
import {ViewPaneState} from '../../app.component';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  sideNavWidth = '200px';
  activeTabName: string;
  activePersona: Persona;
  activePersonaName: string;
  sideNavOpen = false;
  crumbNames: string[] = [];
  viewPaneStates = ViewPaneState;

  @Input() user:User;
  @Input() headerData:HeaderData;
  @Input() viewPaneState: ViewPaneState = null;
  @Output() viewPaneStateChange = new EventEmitter<ViewPaneState>();

  @ViewChild('sidenav') sidenav: ElementRef;
  @ViewChild('sideNavIcon') sideNavIcon: ElementRef;

  constructor(private router: Router,
              private collapsibleNavService: CollapsibleNavService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart ) {
        this.setCrumbNames(event.url);
        this.navigateTo(event.url)
      }
    });
  }

  logout() {
    this.viewPaneStateChange.emit(ViewPaneState.DEFAULT);
    this.router.navigate(['/sign-out']);
  }

  navigateTo(url: string) {
    this.activePersona = null;
    this.activeTabName = null;

    for (let persona of this.headerData.personas) {
      for (let tabs of persona.tabs) {
        if (tabs.URL && tabs.URL.length > 0 && url.startsWith('/' +tabs.URL)) {
          this.activePersona = persona;
          this.activePersonaName = persona.name;
          this.activeTabName = tabs.tabName;

          this.collapsibleNavService.setTabs(persona.tabs, tabs);
          break;
        }
      }
    }
  }
  
  navigateToPersona(persona: Persona, drawer: any) {
    if (persona.tabs.length > 0 ) {
      this.closeNav();
      this.viewPaneStateChange.emit(ViewPaneState.MAXIMISE);
      this.router.navigate([persona.tabs[0].URL]);
    }
  }

  navigateToURL(url: string) {
    this.router.navigate([url]);
  }

  ngOnInit() {
    setTimeout(() => this.viewPaneStateChange.emit(ViewPaneState.MAXIMISE), 1);
  }

  openNav() {
    this.sideNavOpen = true;
    this.sidenav.nativeElement.style.width = this.sideNavWidth;
  }

  closeNav() {
    this.sideNavOpen = false;
    this.sidenav.nativeElement.style.width = '0';
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!this.sideNavIcon) {
      return;
    }

    if (!targetElement || targetElement === this.sideNavIcon.nativeElement) {
      return;
    }

    const clickedInside = this.sidenav.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.closeNav();
    }
  }

  setCrumbNames(url: string) {
    this.crumbNames = url.replace(/^\//, '').split('/');
  }
}
