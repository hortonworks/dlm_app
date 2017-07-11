import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewChecked
} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';

import {PersonaTabs, HeaderData, Persona} from '../../models/header-data';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';

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
              private collapsibleNavService: CollapsibleNavService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigateTo(event.url)
      }
    });
  }

  navigateTo(url: string) {
    this.activePersona = null;
    this.activeTabName = null;

    if (!this.findPersonaAndTabName(url, true) && !this.findPersonaAndTabName(url, false)) {
      //TODO This should be configurable ?
      this.activePersonaName = 'Infra Admin';
      this.activePersonaImageName = 'infra-logo.png';
      this.collapsibleNavService.collpaseSideNav.next(true);
    }
  }

  findPersonaAndTabName(url: string, exactMatch: boolean): boolean {
    for (let persona of this.headerData.personas) {
      for (let tab of persona.tabs) {
        if (tab.URL && tab.URL.length > 0 &&
          ((exactMatch && url == '/' + tab.URL) || (!exactMatch && url.startsWith('/' + tab.URL)))) {
          this.activePersona = persona;
          this.activePersonaName = persona.name;
          this.activePersonaImageName = persona.imageName;
          this.activeTabName = tab.tabName;

          this.collapsibleNavService.setTabs(persona.tabs, tab);

          if (exactMatch) {
            this.collapsibleNavService.collpaseSideNav.next(tab.collapseSideNav || this.collapseSideNav);
          }

          return true;
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
      this.activeTabName = this.collapsibleNavService.activeTab.tabName;
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
