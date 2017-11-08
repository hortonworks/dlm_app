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

describe('welcome page', function() {
    let page: WelcomePage;

    beforeAll(async () => {
      const authPage = await SignInPage.get();
      await authPage.justSignIn();

      page = await WelcomePage.get();
    });

    it('should state identity provider config as one of next steps', async () => {
        await helper.waitForElement(page.cBlockAuth);

        expect(await page.cBlockAuth.isDisplayed()).toBeTruthy();
    });

    it('should state users and group management as one of next steps', async () => {
      await helper.waitForElement(page.cBlockUsers);

      expect(await page.cBlockUsers.isDisplayed()).toBeTruthy();
    });

    it('should navigate to identity provider config page on click of start', async () => {
      await helper.waitForElement(page.bStart);
      await page.bStart.click();

      const nextPage = await IdentityProviderPage.get();
      await helper.waitForElement(nextPage.cForm);
      expect(await nextPage.cForm.isDisplayed()).toBeTruthy();
    });

    afterAll(helper.cleanup);
});
