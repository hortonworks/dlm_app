import {Component, Input, ElementRef, ViewChild, HostListener, Output, EventEmitter} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import {User} from '../../models/user';
import {HeaderData, Persona} from '../../models/header-data';
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
  @Input() persona: Persona;
  @Input() viewPaneState: ViewPaneState;
  @Output() personaChange = new EventEmitter<Persona>();
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

    for (let persona of this.headerData.personas) {
      for (let tabs of persona.tabs) {
        if (tabs.URL && tabs.URL.length > 0 && url.startsWith('/' +tabs.URL)) {
          this.activePersona = persona;
          this. personaChange.emit(this.activePersona);
          this.activePersonaName = persona.name;
          this.activeTabName = tabs.tabName;
          break;
        }
      }
    }
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
