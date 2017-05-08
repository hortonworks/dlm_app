import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

import { User } from '../../models/user';
import {HeaderData} from '../../models/header-data';

declare var componentHandler: any;

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges, AfterViewInit {

  @Input()  user: User;
  @Input()  headerData: HeaderData;

  activeTabName: string;
  regex = new RegExp(/mdl-layout__drawer/);

  constructor() { }

  navigateTo(tabEntry: any) {
    this.activeTabName = tabEntry.tabName;
  }

  navigateToPersona(persona: any) {
    
  }

  ngAfterViewInit() {
    componentHandler.upgradeAllRegistered();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['headerData']) {
      this.activeTabName = this.headerData.tabs[0].tabName;
    }
  }
}
