import {Component, ViewChild, ElementRef, Input, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges,} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';

import {PersonaTabs, HeaderData, Persona} from '../../models/header-data';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';
import {RbacService} from '../../services/rbac.service';

@Component({
  selector: 'dp-collapsible-nav',
  templateUrl: './collapsible-nav.component.html',
  styleUrls: ['./collapsible-nav.component.scss']
})
export class CollapsibleNavComponent implements OnInit, OnChanges {
  collapseSideNav = false;

  activeTabName: string = '';
  personaTabs: PersonaTabs[];
  activePersona: Persona;
  activePersonaName: string;
  activePersonaImageName: string;

  @Input() headerData: HeaderData;

  @ViewChild('personaNavSrc') personaNavSrc: ElementRef;

  constructor(private router: Router,
              private cdRef: ChangeDetectorRef,
              private collapsibleNavService: CollapsibleNavService,
              private rbacService: RbacService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigateTo(event.url)
      }
    });
  }

  navigateTo(url: string) {
    this.activePersona = null;
    this.activeTabName = null;

    if (!this.findPersonaAndTabName(url, true) && !this.findPersonaAndTabName(url, false) && !this.findPersonaForNonTabRoute(url)) {
      let persona = this.rbacService.getActivePersona();
      this.activePersona = persona[0];
      this.activePersonaName = persona[0].name;
      this.activePersonaImageName = persona[0].imageName;
      this.collapsibleNavService.collpaseSideNav.next(true);
    }
  }

  findPersonaForNonTabRoute(url) {
    let personas = this.headerData.personas;
    let persona = personas.find(persona => !!persona.nonTabUrls.find(nonTabUrl => url.startsWith(nonTabUrl)));
    if (persona) {
      this.activePersona = persona;
      this.activePersonaName = persona.name;
      this.activePersonaImageName = persona.imageName;
      this.collapsibleNavService.collpaseSideNav.next(true);
      return true;
    }
    return false;
  }

  findPersonaAndTabName(url: string, exactMatch: boolean): boolean {
    for (let persona of this.headerData.personas) {
      for (let i = 0; i < persona.tabs.length; i++) {
        let tab = persona.tabs[i];
        if (tab.URL && tab.URL.length > 0 &&
          ((exactMatch && url == '/' + tab.URL) || (!exactMatch && url.startsWith('/' + tab.URL)))) {
          this.activePersona = persona;
          this.activePersonaName = persona.name;
          this.activePersonaImageName = persona.imageName;
          setTimeout(() => {
            this.activeTabName = tab.tabName
          }, 100);

          this.collapsibleNavService.setTabs(persona.tabs, tab);

          if (exactMatch) {
            this.collapsibleNavService.collpaseSideNav.next(tab.collapseSideNav || this.collapseSideNav);
            return true;
          }
          if (i === persona.tabs.length - 1 && !exactMatch) {
            this.collapsibleNavService.collpaseSideNav.next(tab.collapseSideNav || this.collapseSideNav);
            return true;
          }

        }
      }
    }
    return false;
  }

  navigateToPersona(persona: Persona) {
    if (persona.tabs.length > 0) {
      this.router.navigate([persona.tabs[0].URL]);
    } else {
      if (persona.tabs.length === 0 && persona.url.length > 0) {
        window.location.pathname = persona.url;
      }
    }
  }

  navigateToURL(tab: PersonaTabs) {
    this.activeTabName = tab.tabName;
    if (tab.angularRouting) {
      this.router.navigate([tab.URL]);
    } else {
      window.location.href = tab.URL;
    }
  }

  ngOnInit() {
    this.collapsibleNavService.navChanged$.subscribe(() => {
      this.personaTabs = this.collapsibleNavService.tabs;
      setTimeout(() => {
        this.activeTabName = this.collapsibleNavService.activeTab.tabName
      }, 100);
    });

    this.collapsibleNavService.collpaseSideNav$.subscribe((minimise: boolean) => {
      if (this.collapseSideNav !== minimise) {
        this.collapseSideNav = minimise;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['headerData'] && this.headerData) {
      this.navigateTo(this.router.url);
    }
  }

  toggleNav() {
    this.collapseSideNav = !this.collapseSideNav;
    this.collapsibleNavService.collpaseSideNav.next(this.collapseSideNav);
  }
}
