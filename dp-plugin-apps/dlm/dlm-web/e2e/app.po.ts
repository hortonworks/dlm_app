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
    return element(by.tagName('dlm-dropdown'));
  }

  getMainActionDropDownItem(item) {
    return this.getMainActionButton().element(by.className('dropdown-menu')).
      element(by.linkText(item));
  }

  getAddButton() {
    return element(by.partialButtonText('Add'));
  }
  
  getDropDownItem(item) {
    return element.all(by.css('.dropdown-menu .dropdown-item')).filter(function(elem) {
      return elem.getText().then( function(text) {
        return text === item;
      });
    }).first();
  }

  clickAddDropdownButton(buttonText) {
    const actionButton = this.getAddButton();
    actionButton.click();
    this.getDropDownItem(buttonText).click();
  }
  
  getUrl() {
    return browser.getCurrentUrl();
  }

  clickNotificationIcon() {
    const icon = element(by.tagName('dlm-notifications')).element(by.className('alerts-label'));
    icon.click();
  }

  clickViewAllNotifications() {
    this.clickNotificationIcon();
    const viewAll = element(by.tagName('dlm-notifications'))
      .element(by.id('notifications-dropdown'))
      .element(by.className('notifications-footer'))
      .element(by.tagName('button'));
    viewAll.click();
  }

}

export class OverviewPage extends Page {

  constructor() {
    super();
    new SideNav().navigateTo('Overview');
  }

}

export class PoliciesPage extends Page {

  constructor() {
    super();
    new SideNav().navigateTo('Policies');
  }
  
  clickAddPolicy() {
    this.clickAddDropdownButton('Policy');
  }

  clickAddPairing() {
    this.clickAddDropdownButton('Pairing');
  }
}

export class PairingsPage extends Page {
  constructor() {
    super();
    new SideNav().navigateTo('Pairings');
  }

  getAddPairingButton() {
    return element(by.buttonText('+ Pairing'));
  }

  clickAddPairing() {
    const actionButton = this.getAddPairingButton();
    actionButton.click();
  }
}

export class ClustersPage extends Page {
  constructor() {
    super();
    new SideNav().navigateTo('Clusters');
  }

  clickAddPolicy() {
    this.clickAddDropdownButton('Policy');
  }

  clickAddPairing() {
    this.clickAddDropdownButton('Pairing');
  }
}
