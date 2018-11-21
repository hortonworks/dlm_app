/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

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
    }).take(1);
  }

  clickAddDropdownButton(buttonText) {
    const actionButton = this.getAddButton();
    actionButton.click();
    const dropdownOption = this.getDropDownItem(buttonText);
    browser.actions().mouseMove(dropdownOption).click().perform();
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
