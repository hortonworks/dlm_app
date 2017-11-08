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
import { WelcomePage } from './welcome.po';

export class IdentityProviderPage {
  uri = '/onboard/identity-provider';

  cForm = $('[data-se="onboard__idp__form"]');
  cNotifications = $('[data-se="onboard__idp__notifications"]');

  fURI = $('[data-se="onboard__idp__uri"]');
  fUserSearchBase = $('[data-se="onboard__idp__user_search_base"]');
  fUserSearchAttr = $('[data-se="onboard__idp__user_search_attr"]');
  fGroupSearchBase = $('[data-se="onboard__idp__group_search_base"]');
  fGroupSearchAttr = $('[data-se="onboard__idp__group_search_attr"]');
  fGroupObjectClass = $('[data-se="onboard__idp__group_object_class"]');
  fGroupMemberAttr = $('[data-se="onboard__idp__group_member_attr"]');

  fAdminBindDN = $('[data-se="onboard__idp__admin_bind_dn"]');

  fAdminPasswordMasked = $('[data-se="onboard__idp__admin_password_masked"]');
  fAdminPasswordPlain = $('[data-se="onboard__idp__admin_password_plain"]');
  fAdminPasswordToggle = $('[data-se="onboard__idp__admin_password_toggle"]');

  bSave = $('[data-se="onboard__idp__save"]');
  bCancel = $('[data-se="onboard__idp__cancel"]');

  private constructor() {}


  static async get() {
    await helper.waitForElement($('[data-se="onboard__idp__form"]'));
    return new IdentityProviderPage();
  }

  async clearForm(){
    await this.fURI.clear();

    await this.fUserSearchBase.clear();
    await this.fUserSearchAttr.clear();
    await this.fGroupSearchBase.clear();
    await this.fGroupSearchAttr.clear();
    await this.fGroupObjectClass.clear();
    await this.fGroupMemberAttr.clear();

    await this.fAdminBindDN.clear();
    await this.fAdminPasswordMasked.clear();
  }
}
