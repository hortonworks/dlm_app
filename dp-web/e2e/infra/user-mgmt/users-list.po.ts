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

import {browser, $, element, by, $$} from 'protractor';
import {helper} from '../../utils/helpers';

export class UsersListPage {

  cUsersList = $$('[data-se-group="users__users-list"]');
  cTabs = $('[data-se="users__user-group-tab"]');
  bAdduser = $('[data-se="users__addUserButton"]');
  cAdduserSlider = $('[data-se="users__slider-add-user"]');
  cUsersInputContainer = $('[data-se="users__add-user__users-input"]');
  cRolesInputContainer = $('[data-se="users__add-user__roles-input"]');
  bSaveButton = $('[data-se="users__add-user__save"]');
  bCancelButton = $('[data-se="users__add-user__cancel"]');
  cErrorNotification = $('[data-se="users__add-user__error"]');

  async get() {
    await helper.safeGet('/infra/manage-access/users');
  }

  getUsername(container) {
    return container.$('[data-se="users__users-list__username"]');
  }

  getMenu(container) {
    return container.$('[data-se="users__users-list__row-menu"]');
  }

  getMenuItems(container) {
    return container.$$('[data-se="users__users-list__row-menu-items"]');
  }

  getGroupsTab(element) {
    return element.$('[data-se="tab_1"]');
  }

  getInputElement(container) {
    return container.$('[data-se="common__taggingWidget__tagInput"]');
  }

  getDropDown(container) {
    return container.$('[data-se="common__tagging-widget__tags-container"]');
  }

  getTagOptions(container) {
    return container.$$('[data-se-group="common__tagging-widget__tag-options"]');
  }

  getTags(container) {
    return container.$$('[data-se-group="common__tagging-widget__tags"]');
  }
}
