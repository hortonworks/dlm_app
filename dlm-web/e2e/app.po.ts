import { browser, element, by } from 'protractor';

export class WebappPage {
  navigateTo() {
    return browser.get('/');
  }

  getNavTitle() {
    return element(by.className('ambari-header')).getText();
  }
}
