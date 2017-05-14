import {Component, Input, OnChanges} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import {User} from '../../models/user';
import {HeaderData, Persona} from '../../models/header-data';

declare var componentHandler:any;

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() user:User;
  @Input() headerData:HeaderData;

  activeTabName: string;
  activePersona: Persona;
  activePersonaName: string;

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart ) {
        this.navigateTo(event.url)
      }
    });
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
          break;
        }
      }
    }
  }

  navigateToPersona(persona: Persona, drawer: any) {
    if (persona.tabs.length > 0 ) {
      drawer.MaterialLayout.toggleDrawer();
      this.router.navigate([persona.tabs[0].URL]);
    }
  }

  navigateToURL(url: string) {
    this.router.navigate([url]);
  }
}
