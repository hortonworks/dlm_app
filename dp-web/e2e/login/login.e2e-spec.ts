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

import { LoginPage } from './login.po';

describe('login to application', function() {
    let page: LoginPage;

    beforeEach(() => {
        page = new LoginPage();
    });

    it('should display error message for invalid credentials', () => {
        page.navigateToLogin();
        page.setUserNameAndPassword('admin', 'password');
        page.submitLoginForm();
        expect(page.getErrorMessage()).toEqual('Credentials were incorrect. Please try again.');
    });

    it('should login for valid credentials', () => {
        page.navigateToLogin();
        page.setUserNameAndPassword('admin', 'admin');
        page.submitLoginForm();
        expect(page.getLocation()).toEqual('http://localhost:4200/onboard');
    });

    it('should logout', () => {
        page.logout();
        expect(page.getLocation()).toEqual('http://localhost:4200/sign-in;cause=sign-out');
    });
});
