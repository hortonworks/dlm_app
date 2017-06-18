export class PersonaTabs {
  tabName:string;
  URL:string;

  constructor(tabName:string, URL:string) {
    this.tabName = tabName;
    this.URL = URL;
  }
}

export class Persona {
  url: string;
  name: string;
  tabs: PersonaTabs[] = [];
  topNav = true;

  constructor(name: string, tabs: PersonaTabs[], topNav = true, url = ''){
    this.url = url;
    this.name = name;
    this.tabs = tabs ? tabs : [];
    this.topNav = topNav;
  }
}

export class HeaderData {
  personas:Persona[] = [];
}