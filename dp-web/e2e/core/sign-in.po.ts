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
import { credential } from '../data';

export class SignInPage {
    public fUsername = $('[data-se="sign_in__username"]');
    public fPassword = $('[data-se="sign_in__password"]');
    public bSubmit = $('[data-se="sign_in__submit"]');
    public tErrorMessage = $('[data-se="sign_in__message"]');
    public bIdentityMenu = $('[data-se="identity__menu"]');

    private constructor() {}

    static async get() {
      const page = new SignInPage();
      await helper.safeGet('/sign-in');

      return page;
    }

    async doSetCredential(username: string, password: string) {
      await helper.waitForElement(this.fUsername);
      await this.fUsername.clear();
      await this.fUsername.sendKeys(username);

      await helper.waitForElement(this.fPassword);
      await this.fPassword.clear();
      await this.fPassword.sendKeys(password);
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
      await this.doSetCredential(credential.username, credential.password);
      await this.doSubmitAndSignIn();
      await helper.waitForElement(this.bIdentityMenu);
    }
}
