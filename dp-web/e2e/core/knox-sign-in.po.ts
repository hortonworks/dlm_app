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

import { browser, $ } from 'protractor';
import { helper } from '../utils/helpers';
import { knoxCredential } from '../data';

export class KnoxSignInPage {
    public fUsername = $('[data-se="knox__username"]');
    public fPassword = $('[data-se="knox__password"]');
    public bSubmit = $('[data-se="knox__sign_in"]');
    public tErrorMessage = $('[data-se="knox__error"]');
    public bIdentityMenu = $('[data-se="identity__menu"]');

    private constructor() {}

    static async get() {
      const page = new KnoxSignInPage();

      await helper.safeGet('/');
      await helper.waitForElement($('[data-se="knox__username"]'));

      return page;
    }

    async doSetCredential(username: string, password: string) {
      await helper.waitForElement(this.fUsername);
      this.fUsername.sendKeys(username);

      await helper.waitForElement(this.fPassword);
      this.fPassword.sendKeys(password);
    }

    async doSubmitAndSignIn() {
      await helper.waitForElement(this.bSubmit);
      await this.bSubmit.click();
    }

    async doGetErrorMessage() {
      await helper.waitForElement(this.tErrorMessage);
      return this.tErrorMessage.getText();
    }

    async justSignIn() {
      await this.doSetCredential(knoxCredential.username, knoxCredential.password);
      await this.doSubmitAndSignIn();
      await helper.waitForElement(this.bIdentityMenu);
    }
}
