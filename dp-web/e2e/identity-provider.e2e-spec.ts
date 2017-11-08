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

import { SignInPage } from './core/sign-in.po';
import { WelcomePage } from './onboard/welcome.po';
import { IdentityProviderPage } from './onboard/identity-provider.po';
import { helper } from './utils/helpers';
import { ldapConfig } from './data';

describe('identity-provider page', function() {
  let page: IdentityProviderPage;

  beforeAll(async () => {
    const signIn = await SignInPage.get();
    await signIn.justSignIn();

    const welcomePage = await WelcomePage.get();
    await welcomePage.bStart.click();

    page = await IdentityProviderPage.get();
  });

  it('should show up with password mode set to masked', async () => {
    await helper.waitForElement(page.fAdminPasswordMasked);

    expect(await page.fAdminPasswordMasked.isDisplayed()).toBeTruthy();
    expect(await page.fAdminPasswordPlain.isPresent()).toBeFalsy();
  });

  it('should change password mode to plain / unmasked on click of toggle', async () => {
    await helper.waitForElement(page.fAdminPasswordToggle);
    await page.fAdminPasswordToggle.click();

    expect(await page.fAdminPasswordPlain.isDisplayed()).toBeTruthy();
    expect(await page.fAdminPasswordMasked.isPresent()).toBeFalsy();
  });

  it('should change password mode back to masked on click of toggle', async () => {
    await helper.waitForElement(page.fAdminPasswordToggle);
    await page.fAdminPasswordToggle.click();

    expect(await page.fAdminPasswordMasked.isDisplayed()).toBeTruthy();
    expect(await page.fAdminPasswordPlain.isPresent()).toBeFalsy();
  });

  it('should display error message for invalid ldap uri', async () => {
    await helper.waitForElement(page.cForm);

    await page.fURI.sendKeys('ldap://some-unreachable-ldap-server.test');

    await page.fUserSearchBase.sendKeys(ldapConfig.user_search_base);
    await page.fUserSearchAttr.sendKeys(ldapConfig.user_search_attr);
    await page.fGroupSearchBase.sendKeys(ldapConfig.group_search_base);
    await page.fGroupSearchAttr.sendKeys(ldapConfig.group_search_attr);
    await page.fGroupObjectClass.sendKeys(ldapConfig.group_object_class);
    await page.fGroupMemberAttr.sendKeys(ldapConfig.group_member_attr);

    await page.fAdminBindDN.sendKeys(ldapConfig.admin_bind_dn);
    await page.fAdminPasswordMasked.sendKeys(ldapConfig.admin_password);

    await page.bSave.click();

    await helper.waitForElement(page.cNotifications);
    expect(await page.cNotifications.isDisplayed()).toBeTruthy();
  });

  it('should display error message for invalid password', async () => {
    await helper.waitForElement(page.cForm);

    await page.clearForm();

    await page.fURI.sendKeys(ldapConfig.uri);

    await page.fUserSearchBase.sendKeys(ldapConfig.user_search_base);
    await page.fUserSearchAttr.sendKeys(ldapConfig.user_search_attr);
    await page.fGroupSearchBase.sendKeys(ldapConfig.group_search_base);
    await page.fGroupSearchAttr.sendKeys(ldapConfig.group_search_attr);
    await page.fGroupObjectClass.sendKeys(ldapConfig.group_object_class);
    await page.fGroupMemberAttr.sendKeys(ldapConfig.group_member_attr);

    await page.fAdminBindDN.sendKeys(ldapConfig.admin_bind_dn);
    await page.fAdminPasswordMasked.sendKeys('wrong-password');

    await page.bSave.click();

    await helper.waitForElement(page.cNotifications);
    expect(await page.cNotifications.isDisplayed()).toBeTruthy();
  });

  it('should successfully save ldap config and navigate to access management', async () => {
    await helper.waitForElement(page.cForm);

    await page.clearForm();

    await page.fURI.sendKeys(ldapConfig.uri);

    await page.fUserSearchBase.sendKeys(ldapConfig.user_search_base);
    await page.fUserSearchAttr.sendKeys(ldapConfig.user_search_attr);
    await page.fGroupSearchBase.sendKeys(ldapConfig.group_search_base);
    await page.fGroupSearchAttr.sendKeys(ldapConfig.group_search_attr);
    await page.fGroupObjectClass.sendKeys(ldapConfig.group_object_class);
    await page.fGroupMemberAttr.sendKeys(ldapConfig.group_member_attr);

    await page.fAdminBindDN.sendKeys(ldapConfig.admin_bind_dn);
    await page.fAdminPasswordMasked.sendKeys(ldapConfig.admin_password);

    await page.bSave.click();

    await helper.waitForElement(page.cNotifications);
    expect(await page.cNotifications.isPresent()).toBeFalsy();
  });

  afterAll(helper.cleanup);
});
