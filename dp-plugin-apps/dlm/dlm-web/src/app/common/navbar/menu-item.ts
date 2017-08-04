export class MenuItem {
  label = '';
  iconClasses = '';
  iconHtml = '';
  linkURL = '';
  qeAttr = '';
  subMenu?: MenuItem[] = [];

  constructor(label: string, linkURL: any, iconClasses: any, qeAttr, subMenu?: MenuItem[]) {
    this.label = label;
    this.linkURL = linkURL;
    this.iconClasses = iconClasses;
    this.qeAttr = qeAttr;
    if (subMenu) {
      this.subMenu = subMenu;
    }
  }
}
