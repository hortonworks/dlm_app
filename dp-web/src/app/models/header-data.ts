export class PersonaTabs {
  tabName:string;
  URL:string;

  constructor(tabName:string, URL:string) {
    this.tabName = tabName;
    this.URL = URL;
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