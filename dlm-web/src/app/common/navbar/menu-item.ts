export class MenuItem {
  label = '';
  iconHtml: any = '';
  linkURL: any = '';
  subMenu?: MenuItem[] = [];

  constructor(label: string, linkURL: any, iconHtml: any, subMenu?: MenuItem[]) {
    this.label = label;
    this.iconHtml = iconHtml;
    this.linkURL = linkURL;
    if (subMenu) {
      this.subMenu = subMenu;
    }
  }
}
