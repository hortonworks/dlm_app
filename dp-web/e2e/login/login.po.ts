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

import { browser, element, by } from 'protractor';
import { waitForElementVisibility } from '../utils/e2e_util';

export class LoginPage {
    private userNameSelector = by.css('form #username');
    private passwordSelector = by.css('form #password');
    private titleSelector = by.css('header .mdl-layout-title');
    private signoutSelector = by.cssContainingText('.dp-header__user a', 'SignOut');
    private userButtonSelector = by.css('.dp-header__user button');

    navigateToLogin() {
        return browser.get('/sign-in');
    }

    login() {
        waitForElementVisibility(element(this.userNameSelector)).then(() => {
          this.setUserNameAndPassword('admin', 'password');
          this.submitLoginForm();
        });
        waitForElementVisibility(element(this.titleSelector));
    }

    logout() {
        browser.ignoreSynchronization = true;
        let signoutElement = element(this.signoutSelector);
        element(this.userButtonSelector).click();
        waitForElementVisibility(signoutElement).then(() => {
            signoutElement.click();
        });
    }

    setUserNameAndPassword(userName: string, password: string) {
        element(this.userNameSelector).sendKeys(userName);
        element(this.passwordSelector).sendKeys(password);
    }

    submitLoginForm() {
        return element(by.buttonText('Sign In')).click();
    }

    getErrorMessage() {
        return element(by.css('.error-message')).getText();
    }

    getLocation() {
        return browser.getCurrentUrl().then(url => {
            return url;
        });
    }
}
