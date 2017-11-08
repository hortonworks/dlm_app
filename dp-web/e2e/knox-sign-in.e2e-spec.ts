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

import { KnoxSignInPage } from './core/knox-sign-in.po';
import { helper } from './utils/helpers';
import { knoxCredential } from './data'

describe('knox-sign-in page', function() {
    let page: KnoxSignInPage;

    beforeEach(async () => {
        page = await KnoxSignInPage.get();
    });

    it('should display error message for invalid credentials', async () => {
        await page.doSetCredential('admin', 'wrong-password');
        await page.doSubmitAndSignIn();

        await helper.waitForElement(page.tErrorMessage);
        expect(await page.tErrorMessage.isDisplayed()).toBeTruthy();
    });

    it('should login for valid credentials', async () => {
        await page.doSetCredential(knoxCredential.username, knoxCredential.password);
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

      await page.doSetCredential(knoxCredential.username, knoxCredential.password);
      await page.doSubmitAndSignIn();

      await helper.waitForElement(page.bIdentityMenu);
      expect(await page.bIdentityMenu.isDisplayed()).toBeTruthy();
    });

    afterEach(helper.cleanup);
});
