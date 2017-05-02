import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { User } from '../../models/user';
import {HeaderData} from '../../models/header-data';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges {

  @Input()
  user: User;

  @Input()
  headerData: HeaderData;

  activeTabName: string;

  constructor() { }

  navigateTo(tabEntry: any) {
    this.activeTabName = tabEntry.tabName;
  }

  navigateToPersona(persona: any) {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['headerData']) {
      this.activeTabName = this.headerData.tabs[0].tabName;
    }
  }
}
