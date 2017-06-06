import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import {HeaderData, Persona} from '../../models/header-data';
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

  @Input() persona: Persona;
  @Input() headerData: HeaderData;
  @Output() viewPaneStateChange = new EventEmitter<ViewPaneState>();
  @ViewChild('sideNav') sideNav: ElementRef;

  @Input()
  get viewPaneState(): ViewPaneState {
    return this._viewPaneState;
  }

  set viewPaneState(value: ViewPaneState) {
    this._viewPaneState = value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['persona']) {
      if (this.persona && !this.persona.topNav) {
        this.activeTabName = this.persona.tabs[0].tabName;
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
