export class PersonaTabs {
  tabName: string;
  URL: string;
  angularRouting: boolean;
  iconClassName: string;
  collapseSideNav: boolean;

  constructor(tabName:string, URL:string, iconClassName = 'fa-globe', collapseSideNav = false, angularRouting = true) {
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
  tabs: PersonaTabs[] = [];
  nonTabUrls: string[] = [];
  enabled:boolean;

  constructor(name: string, tabs: PersonaTabs[], nonTabUrls: string[], url = '', imageName = '', enabled = true){
    this.url = url;
    this.name = name;
    this.imageName = imageName;
    this.tabs = tabs ? tabs : [];
    this.nonTabUrls = nonTabUrls ? nonTabUrls : [];
    this.enabled = enabled;
  }
}

export class HeaderData {
  personas:Persona[] = [];
}
