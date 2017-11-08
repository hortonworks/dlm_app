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
import { WelcomePage } from './onboard/welcome-after-idp.po';
import { ClusterAddPage } from './infra/clusters/cluster-add.po';
import { helper } from './utils/helpers';

describe('welcome page', function() {
    let page: WelcomePage;

    beforeAll(async () => {
      const authPage = await KnoxSignInPage.get();
      authPage.justSignIn();

      page = new WelcomePage();
    });

    it('should state cluster config as one of next steps', async () => {
        await helper.waitForElement(page.cBlockClusters);

        expect(await page.cBlockClusters.isDisplayed()).toBeTruthy();
    });

    it('should state user and group config as one of next steps', async () => {
        await helper.waitForElement(page.cBlockUsers);

        expect(await page.cBlockUsers.isDisplayed()).toBeTruthy();
    });

    it('should state service config as one of next steps', async () => {
        await helper.waitForElement(page.cBlockServices);

        expect(await page.cBlockServices.isDisplayed()).toBeTruthy();
    });

    it('should navigate to identity provider config page on click of start', async () => {
      await helper.waitForElement(page.bStart);
      await page.bStart.click();

      const nextPage = new ClusterAddPage();
      await helper.waitForElement(nextPage.cTitle);
      expect(await nextPage.cTitle.isDisplayed()).toBeTruthy();
    });

    afterAll(helper.cleanup);
});
