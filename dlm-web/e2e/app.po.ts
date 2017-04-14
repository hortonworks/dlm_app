import { browser, element, by } from 'protractor';

export class SideNav {

  navigateTo(target) {
    const menu = element(by.className('side-nav-menu'));
    menu.element(by.partialLinkText(target)).click();
  }

}

export class Page {

  getNavTitle() {
    return element(by.className('ambari-header')).getText();
  }

  getMainActionButton() {
    return element(by.tagName('dlm-dropdown'))
  }

  getMainActionDropDownItem(item) {
    return this.getMainActionButton().element(by.className('dropdown-menu')).
      element(by.linkText(item));
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

}

export class OverviewPage extends Page {

  constructor() {
    super()
    new SideNav().navigateTo('Overview');
  }

}

export class PolicyPage extends Page {

  constructor() {
    super()
    new SideNav().navigateTo('Policies');
  }

  clickAddPolicy() {
    const actionButton = this.getMainActionButton();
    actionButton.click();

    this.getMainActionDropDownItem('Policy').click();
  }
}
