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

import {ServiceEnablementPage} from './service-enablement.po';
import {browser} from 'protractor';
import {helper} from '../../utils/helpers';
import {ServiceVerificationPage} from './service-verification.po';
import {SignInPage} from '../../core/sign-in.po';
import {IdentityComponent} from '../../components/identity.po';
describe('service enablement page', function () {

  let page: ServiceEnablementPage;
  let loginPage: SignInPage;
  let identityComponent: IdentityComponent;

  beforeAll(async () => {
    loginPage = await SignInPage.get();
    await loginPage.justSignIn();

    identityComponent = new IdentityComponent();
  });

  beforeEach(async () => {
    page = new ServiceEnablementPage();
    await page.getEnablementPage();
  });

  it('On Hover of an available service should show Enable button', async () => {
    await helper.waitForElement(page.cAvailableServices.first());
    browser.actions().mouseMove(page.cAvailableServices.first()).perform();
    await helper.waitForElement(page.getActionButton(page.cAvailableServices.first()));
    expect(await page.getActionButton(page.cAvailableServices.first()).isDisplayed()).toBeTruthy();
  });

  it('Click of enable button should go to verification page', async () => {
    await helper.waitForElement(page.cAvailableServices.first());
    browser.actions().mouseMove(page.cAvailableServices.first()).perform();
    await helper.waitForElement(page.getActionButton(page.cAvailableServices.first()));
    page.getActionButton(page.cAvailableServices.first()).click();
    let verificationPage = new ServiceVerificationPage();
    await helper.waitForElement(verificationPage.iSmartSenseInput);
    expect(await verificationPage.iSmartSenseInput.isDisplayed()).toBeTruthy();
  });

  afterAll(helper.cleanup);

});
