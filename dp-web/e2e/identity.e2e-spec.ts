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

import { browser } from 'protractor';

import { SignInPage } from './core/sign-in.po';
import { IdentityComponent } from './components/identity.po';
import { helper } from './utils/helpers';

describe('identity component', function() {
    let component: IdentityComponent;

    beforeEach(async () => {
      // login
      const page = await SignInPage.get();
      page.justSignIn();

      component = new IdentityComponent();
    });

    it('should display the right username in header after login', async () => {
      await helper.waitForElement(component.bIdentityMenu);
      await component.bIdentityMenu.click();

      await helper.waitForElement(component.tDisplayName);
      const displayName = await component.tDisplayName.getText();

      expect(displayName).toEqual('Super Administrator');
    });

    it('should logout on click of logout', async () => {
      await helper.waitForElement(component.bIdentityMenu);
      await component.bIdentityMenu.click();

      await helper.waitForElement(component.bSignOut);
      await component.bSignOut.click();

      const cookies = await browser.manage().getCookies();
      expect(cookies.length).toEqual(0);
    });

    afterEach(helper.cleanup);
});
