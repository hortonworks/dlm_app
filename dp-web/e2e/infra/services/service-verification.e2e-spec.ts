/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {helper} from '../../utils/helpers';
import {ServiceVerificationPage} from './service-verification.po';
import {ServiceEnablementPage} from './service-enablement.po';
import {IdentityComponent} from '../../components/identity.po';
import {SignInPage} from '../../core/sign-in.po';
import {CollapsibleNav} from '../../components/collapsible-nav.po';
import {browser, by, element} from 'protractor';

describe('service enablement page', function () {

  let page: ServiceVerificationPage;
  let loginPage: SignInPage;
  let identityComponent: IdentityComponent;

  beforeAll(async () => {
    loginPage = await SignInPage.get();
    await loginPage.justSignIn();
    identityComponent = new IdentityComponent();
  });

  beforeEach(async () => {
    page = new ServiceVerificationPage();
    await page.getVerificationPage();
  });

  it('Takes to services page on clicking of cancel button', async () => {
    await helper.waitForElement(page.bCancelButton);
    await page.bCancelButton.click();
    let enablementPage = new ServiceEnablementPage();
    await helper.waitForElement(enablementPage.cAvailableServices.first());
    expect(await enablementPage.cAvailableServices.first().isDisplayed()).toBeTruthy();
  });

  it('Shows error message on entering incorrect smart sense id', async () => {
    await page.setSmartSenseId('A-123-C-34');
    await page.doVerify();
    await helper.waitForElement(page.tIncorrectSmartSenseId);
    expect(await page.tIncorrectSmartSenseId.isDisplayed()).toBeTruthy();
  });

  it('shows Verified on entering correct smart sense id ', async () => {
    await page.setSmartSenseId('A-12345678-C-34125678');
    await page.doVerify();
    await helper.waitForElement(page.bVerifiedButton);
    expect(await page.bVerifiedButton.isDisplayed()).toBeTruthy();
  });

  it('Click of next button takes without entering valid smart sense id shows error ', async () => {
    await page.doNext();
    await helper.waitForElement(page.cErrorNotificationBar);
    expect(await page.cErrorNotificationBar.isDisplayed()).toBeTruthy();
  });

  it('Click of next button takes after entering valid smart sense id redirects to services page ', async () => {
    await page.setSmartSenseId('A-12345678-C-34125678');
    await page.doNext();
    let enablementPage = new ServiceEnablementPage();
    await helper.waitForElement(enablementPage.cSuccessNotification);
    expect(await enablementPage.cSuccessNotification.isDisplayed()).toBeTruthy();
  });

  it('Enabled service is available for users on re-login', async () => {
    let identityComponent = new IdentityComponent();
    await identityComponent.doLogout();
    let loginPage = await SignInPage.get();
    await loginPage.justSignIn();
    let enablementPage = new ServiceEnablementPage();
    let collapsibleNavComponent = new CollapsibleNav();
    await enablementPage.getEnablementPage();
    await collapsibleNavComponent.openPopupMenu();
    await helper.waitForElement(collapsibleNavComponent.cAvailablePersona.first());
    await helper.waitForElement(enablementPage.getEnbledServiceName(enablementPage.cEnabledServices.first()));
    await helper.waitForElement(enablementPage.cEnabledServices.first());
    expect(element(by.cssContainingText('.suit-navigation',enablementPage.getEnbledServiceName(enablementPage.cEnabledServices.first()).getText())).isPresent()).toBeTruthy();
  });

  it('Shows list of clusters when expand button is clicked', async () => {
    let enablementPage = new ServiceEnablementPage();
    await enablementPage.getEnablementPage();
    await helper.waitForElement(enablementPage.cEnabledServices.first());
    await enablementPage.getShowClustersButton(enablementPage.cEnabledServices.first());
    await enablementPage.getShowClustersButton(enablementPage.cEnabledServices.first()).click();
    await helper.waitForElement(enablementPage.cClusterList.first());
    expect(enablementPage.cClusterList.first().isPresent()).toBeTruthy()
  });

  afterAll(async () => {
    await helper.cleanup();
  });

});
