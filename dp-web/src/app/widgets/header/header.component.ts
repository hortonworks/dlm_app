import {Component, Input, ElementRef, ViewChild, HostListener, Output, EventEmitter} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import {User} from '../../models/user';
import {HeaderData, Persona, PersonaTabs} from '../../models/header-data';
import {ViewPaneState} from '../../app.component';

declare var componentHandler:any;

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  sideNavWidth = '200px';
  activeTabName: string;
  activePersona: Persona;
  activePersonaName: string;
  sideNavOpen = false;
  viewPaneStates = ViewPaneState;

  @Input() user:User;
  @Input() headerData:HeaderData;
  @Input() personaTabs: PersonaTabs[];
  @Input() viewPaneState: ViewPaneState;
  @Output() personaTabsChange = new EventEmitter<PersonaTabs[]>();
  @Output() viewPaneStateChange = new EventEmitter<ViewPaneState>();

  @ViewChild('sidenav') sidenav: ElementRef;
  @ViewChild('sideNavIcon') sideNavIcon: ElementRef;

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart ) {
        this.navigateTo(event.url)
      }
    });
  }

  logout() {
    this.router.navigate(['/sign-out']);
  }

  navigateTo(url: string) {
    this.activePersona = null;
    this.activeTabName = null;

    let matchFound = false;
    for (let persona of this.headerData.personas) {
      let personaTabs = persona.tabs;

      for (let firstLevelTab of personaTabs) {
        matchFound = this.findMatchingTab(firstLevelTab, url, persona, personaTabs);
        if (matchFound) {
          break;
        } else {
          for (let secondLevelTab of firstLevelTab.tabs) {
            matchFound = this.findMatchingTab(secondLevelTab, url, persona, firstLevelTab.tabs);
            if (matchFound) {
              break;
            }
          }
        }
      }
      if (matchFound) {
        break;
      }
    }
  }

  private findMatchingTab(tab: PersonaTabs, url:string, persona, tabs: PersonaTabs[]): boolean {
    if (tab.URL && tab.URL.length > 0 && url.startsWith('/' +tab.URL)) {
      this.activePersona = persona;
      this.activePersonaName = persona.name;
      this.activeTabName = tab.tabName;
      if (this.activePersona.topNav) {
        this.personaTabsChange.emit([]);
      } else {
        this.personaTabsChange.emit(tabs);
      }
      return true;
    }
    return false;
  }

  navigateToPersona(persona: Persona, drawer: any) {
    if (persona.tabs.length > 0 ) {
      this.closeNav();
      this.viewPaneStateChange.emit(ViewPaneState.DEFAULT);
      this.router.navigate([persona.tabs[0].URL]);
    }
  }

  navigateToURL(url: string) {
    this.router.navigate([url]);
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
}
