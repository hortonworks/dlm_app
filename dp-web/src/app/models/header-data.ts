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