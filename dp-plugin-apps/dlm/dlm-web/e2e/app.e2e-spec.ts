/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { browser } from 'protractor';
import { SideNav, OverviewPage, PoliciesPage, PairingsPage, ClustersPage } from './app.po';

// TODO: Integrate with ngx-translate

describe('DLM', function() {

  let sideNav = null;

  beforeEach(() => {
    sideNav = new SideNav();
    // Setting the flag waitForAngularEnabled to true will trigger timeout errors on tests like below -
    // Failed: Timed out waiting for asynchronous Angular tasks to finish after 20 seconds. This may be because the
    // current page is not an Angular application. Please see the FAQ for more details:
    // https://github.com/angular/protractor/blob/master/docs/timeouts.md#waiting-for-angular
    // The timeout failure happens because of polling. When long polling is enabled, angular keeps waiting for the
    // requests to complete and ends up hitting the protractor timeout
    browser.waitForAngularEnabled(false);
  });

  // This is needed because clicking the side nav items before this
  // causes:
  // Failed: Error while waiting for Protractor to sync with the page: "window.angular is undefined
  it('should load the home page', () => {
    browser.get('/');
  });

  it('should navigate to create policy page from policies page', () => {
    const page = new PoliciesPage();

    page.clickAddPolicy();

    expect(page.getUrl()).toContain('/policies/create');
  });

  it('should have correct nav title', () => {
    const page = new OverviewPage();

    expect(page.getNavTitle()).toEqual('DATA LIFECYCLE MANAGER');
  });

  it('should navigate to create pairing page from policies page', () => {
    const page = new PoliciesPage();

    page.clickAddPairing();

    expect(page.getUrl()).toContain('/pairings/create');
  });

  it('should navigate to create pairing page from pairings page', () => {
    const page = new PairingsPage();

    page.clickAddPairing();

    expect(page.getUrl()).toContain('/pairings/create');
  });

  it('should navigate to create policy page from clusters page', () => {
    const page = new ClustersPage();

    page.clickAddPolicy();

    expect(page.getUrl()).toContain('/policies/create');
  });

  it('should navigate to create pairing page from clusters page', () => {
    const page = new ClustersPage();

    page.clickAddPairing();

    expect(page.getUrl()).toContain('/pairings/create');
  });

  it('should navigate to notifications page when View All button is clicked', () => {
    const page = new OverviewPage();

    page.clickViewAllNotifications();

    expect(page.getUrl()).toContain('/notifications');
  });
});
