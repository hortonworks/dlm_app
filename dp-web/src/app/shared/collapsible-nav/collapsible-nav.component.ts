import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import {HeaderData, Persona, PersonaTabs} from '../../models/header-data';
import {ViewPaneState} from '../../app.component';

@Component({
  selector: 'dp-collapsible-nav',
  templateUrl: './collapsible-nav.component.html',
  styleUrls: ['./collapsible-nav.component.scss']
})
export class CollapsibleNavComponent implements OnChanges {

  private _viewPaneState: ViewPaneState;

  collpased = false;
  expandedWidth = '200px';
  collpasedWidth = '50px';
  activeTabName: string = '';

  @Input() personaTabs: PersonaTabs[];
  @Output() viewPaneStateChange = new EventEmitter<ViewPaneState>();
  @ViewChild('sideNav') sideNav: ElementRef;

  @Input()
  get viewPaneState(): ViewPaneState {
    return this._viewPaneState;
  }

  set viewPaneState(value: ViewPaneState) {
    this._viewPaneState = value;
  }

  constructor(private router: Router) { }

  navigateToURL(tab: PersonaTabs) {
    this.activeTabName = tab.tabName;
    this.router.navigate([tab.URL]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['personaTabs']) {
      if (this.personaTabs && this.personaTabs.length > 0) {
        this.activeTabName = this.personaTabs[0].tabName;
        // Bad hack since viewPaneState is changed by this comp and header component the change cannot happen in same cycle
        setTimeout(() => {this.viewPaneStateChange.emit(ViewPaneState.MAXIMISE)}, 1);
      }
    }
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
