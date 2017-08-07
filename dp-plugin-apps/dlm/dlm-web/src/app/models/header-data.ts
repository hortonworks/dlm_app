/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export class PersonaTabs {
  tabName: string;
  URL: string;
  angularRouting: boolean;
  iconClassName: string;
  collapseSideNav: boolean;

  constructor(tabName: string, URL: string, iconClassName = 'fa-globe', collapseSideNav = false, angularRouting = true) {
    this.tabName = tabName;
    this.URL = URL;
    this.tabName = tabName;
    this.iconClassName = iconClassName;
    this.collapseSideNav = collapseSideNav;
    this.angularRouting = angularRouting;
  }
}

export class Persona {
  url: string;
  name: string;
  imageName: string;
  active: boolean;
  tabs: PersonaTabs[] = [];

  constructor(name: string, tabs: PersonaTabs[], url = '', imageName = '', active = false) {
    this.url = url;
    this.name = name;
    this.imageName = imageName;
    this.tabs = tabs ? tabs : [];
    this.active = active;
  }
}

export class HeaderData {
  personas: Persona[] = [];
}
