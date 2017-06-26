export class PersonaTabs {
  tabName: string;
  URL: string;
  iconClassName: string;
  collapseSideNav: boolean;

  constructor(tabName:string, URL:string, iconClassName = 'fa-globe', collapseSideNav = false) {
    this.URL = URL;
    this.tabName = tabName;
    this.iconClassName = iconClassName;
    this.collapseSideNav = collapseSideNav;
  }
}

export class Persona {
  url: string;
  name: string;
  imageName: string;
  tabs: PersonaTabs[] = [];

  constructor(name: string, tabs: PersonaTabs[], url = '', imageName = ''){
    this.url = url;
    this.name = name;
    this.imageName = imageName;
    this.tabs = tabs ? tabs : [];
  }
}

export class HeaderData {
  personas:Persona[] = [];
}