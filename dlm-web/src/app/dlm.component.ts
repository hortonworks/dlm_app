import { Component } from '@angular/core';
import { MenuItem } from './common/navbar/menu-item';

const MENUITEMS: MenuItem[] = [
  {
    label: 'Overview',
    linkURL: './overview',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-home"></span>',
    subMenu: []
  },
  {
    label: 'My Clusters',
    linkURL: './clusters',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-globe"></span>',
    subMenu: []
  },
  {
    label: 'Pairings',
    linkURL: './pairings',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-resize-horizontal"></span>',
    subMenu: []
  },
  {
    label: 'Policies',
    linkURL: './policies',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-list-alt"></span>',
    subMenu: []
  },
  {
    label: 'Jobs',
    linkURL: './jobs',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-hourglass"></span>',
    subMenu: []
  },
  {
    label: 'Help',
    linkURL: './help',
    iconHtml: '<span class="navigation-icon glyphicon glyphicon-info-sign"></span>',
    subMenu: []
  }

];

const HEADER: MenuItem = {
  label: 'DATA LIFECYCLE MANAGER',
  linkURL: './overview',
  iconHtml: '<i class="fa fa-gg" aria-hidden="true"></i>',
  subMenu: []
};

@Component({
  selector: 'dlm',
  templateUrl: './dlm.component.html',
  styleUrls: ['./dlm.component.scss']
})

export class DlmComponent {
  header = HEADER;
  menuItems = MENUITEMS;
  mainContentSelector = '#dlm_content';
  fitHeight = true;
  constructor( ) {

  }
}
