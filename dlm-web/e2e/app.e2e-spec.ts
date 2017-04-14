import { browser } from 'protractor';
import { SideNav, OverviewPage, PolicyPage } from './app.po';

// TODO: Integrate with ngx-translate

describe('DLM', function() {

  let sideNav = null;

  beforeEach(() => {
    sideNav = new SideNav();
  });

  // This is needed because clicking the side nav items before this
  // causes:
  // Failed: Error while waiting for Protractor to sync with the page: "window.angular is undefined
  it('should load the home page', () => {
    browser.get('/');
  });

  it('should have correct nav title', () => {
    const page = new OverviewPage();

    expect(page.getNavTitle()).toEqual('DATA LIFECYCLE MANAGER');
  });

  it('should navigate to create policy page', () => {
    const page = new PolicyPage();

    page.clickAddPolicy();

    expect(page.getUrl()).toContain('/policies/create');
  })
});
