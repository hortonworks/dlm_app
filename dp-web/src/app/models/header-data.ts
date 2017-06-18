export class PersonaTabs {
  tabName: string;
  URL: string;
  iconClassName: string;

  constructor(tabName:string, URL:string, iconClassName = 'fa-globe') {
    this.tabName = tabName;
    this.URL = URL;
    this.iconClassName = iconClassName;
  }
}

export class Persona {
  name: string;
  tabs: PersonaTabs[] = [];

  constructor(name: string, tabs: PersonaTabs[]){
    this.name = name;
    this.tabs = tabs ? tabs : [];
  }
}

export class HeaderData {
  personas:Persona[] = [];
}