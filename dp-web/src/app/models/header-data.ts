export class PersonaTabs {
  tabName: string;
  URL: string;
  iconClassName: string;
  tabs: PersonaTabs[];

  constructor(tabName:string, URL:string, iconClassName = 'fa-globe', tabs = []) {
    this.tabName = tabName;
    this.URL = URL;
    this.iconClassName = iconClassName;
    this.tabs = tabs;
  }
}

export class Persona {
  name: string;
  tabs: PersonaTabs[] = [];
  topNav = true;

  constructor(name: string, tabs: PersonaTabs[], topNav = true){
    this.name = name;
    this.tabs = tabs ? tabs : [];
    this.topNav = topNav;
  }
}

export class HeaderData {
  personas:Persona[] = [];
}