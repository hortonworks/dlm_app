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

import { $ } from 'protractor';
import { helper } from '../utils/helpers';

export class IdentityComponent {
    public bIdentityMenu = $('[data-se="identity__menu"]');
    public cIdentityDetail = $('[data-se="identity__detail"]');
    public tDisplayName = $('[data-se="identity__display_name"]');
    public bChangePassword = $('[data-se="identity__password_change"]');
    public bSignOut = $('[data-se="identity__sign_out"]');

  async doLogout(){
    await helper.waitForElement(this.bIdentityMenu);
    await this.bIdentityMenu.click();

    await helper.waitForElement(this.bSignOut);
    await this.bSignOut.click();
  }

}
