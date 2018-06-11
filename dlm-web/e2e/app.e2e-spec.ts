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
