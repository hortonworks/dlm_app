import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {HeaderData, Persona, PersonaTabs} from '../../models/header-data';
import {ViewPaneState} from '../../app.component';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';

@Component({
  selector: 'dp-collapsible-nav',
  templateUrl: './collapsible-nav.component.html',
  styleUrls: ['./collapsible-nav.component.scss']
})
export class CollapsibleNavComponent implements OnInit {

  private _viewPaneState: ViewPaneState;

  collpased = false;
  expandedWidth = '200px';
  collpasedWidth = '50px';
  activeTabName: string = '';

  personaTabs: PersonaTabs[];
  @Output() viewPaneStateChange = new EventEmitter<ViewPaneState>();
  @ViewChild('sideNav') sideNav: ElementRef;

  @Input()
  get viewPaneState(): ViewPaneState {
    return this._viewPaneState;
  }

  set viewPaneState(value: ViewPaneState) {
    this._viewPaneState = value;
  }

  constructor(private router: Router,
              private collapsibleNavService: CollapsibleNavService) { }

  navigateToURL(tab: PersonaTabs) {
    this.activeTabName = tab.tabName;
    this.router.navigate([tab.URL]);
  }

  ngOnInit() {
    this.collapsibleNavService.navChanged$.subscribe(() => {
      this.personaTabs = this.collapsibleNavService.tabs;
      this.activeTabName = this.collapsibleNavService.activeTab.tabName;
    });
  }

  toggleNav() {
    if (this.collpased) {
      this.openNav();
    } else {
      this.closeNav();
    }
    this.collpased = !this.collpased;
    this.viewPaneStateChange.emit(this.collpased ? ViewPaneState.MINIMISE : ViewPaneState.MAXIMISE);
  }

  openNav() {
    this.sideNav.nativeElement.style.width = this.expandedWidth;
  }

  closeNav() {
    this.sideNav.nativeElement.style.width = this.collpasedWidth;
  }
}
