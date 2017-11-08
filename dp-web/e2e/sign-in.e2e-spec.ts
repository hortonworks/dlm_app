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
import { helper } from './utils/helpers';
import { credential } from  './data';

describe('sign-in page', function() {
    let page: SignInPage;

    beforeEach(async () => {
      page = await SignInPage.get();
    });

    it('should display error message for invalid credentials', async () => {
        await page.doSetCredential('admin', 'wrong-password');
        await page.doSubmitAndSignIn();

        await helper.waitForElement(page.tErrorMessage);
        expect(await page.tErrorMessage.isDisplayed()).toBeTruthy();
    });

    it('should login for valid credentials', async () => {
        await page.doSetCredential(credential.username, credential.password);
        await page.doSubmitAndSignIn();

        await helper.waitForElement(page.bIdentityMenu);
        expect(await page.bIdentityMenu.isDisplayed()).toBeTruthy();
    });

    it('should allow users to login after a rejected login without refresh', async () => {
      await page.doSetCredential('admin', 'wrong-password');
      await page.doSubmitAndSignIn();

      await helper.waitForElement(page.tErrorMessage);

      await page.fUsername.clear();
      await page.fPassword.clear();

      await page.doSetCredential(credential.username, credential.password);
      await page.doSubmitAndSignIn();

      await helper.waitForElement(page.bIdentityMenu);
      expect(await page.bIdentityMenu.isDisplayed()).toBeTruthy();
    });

    afterEach(helper.cleanup);
});
