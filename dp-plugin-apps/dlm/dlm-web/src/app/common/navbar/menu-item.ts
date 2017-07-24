export class MenuItem {
  label = '';
  iconClasses = '';
  iconHtml = '';
  linkURL: any = '';
  subMenu?: MenuItem[] = [];

  constructor(label: string, linkURL: any, iconClasses: any, subMenu?: MenuItem[]) {
    this.label = label;
    this.linkURL = linkURL;
    this.iconClasses = iconClasses;
    if (subMenu) {
      this.subMenu = subMenu;
    }
  }
}
