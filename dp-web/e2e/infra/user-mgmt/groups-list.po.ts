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

export class GroupsListPage {
  cGroupsTable = $('[data-se="groups__groups-table" ]');
  cGroupsList = $$('[data-se-group="groups__groups-list"]');
  cTabs = $('[data-se="groups__user-group-tab"]');
  bAddgroup = $('[data-se="groups__addGroupButton"]');
  cAddgroupSlider = $('[data-se="groups__slider-add-group"]');
  cGroupsInputContainer = $('[data-se="groups__add-group__groups-input"]');
  cRolesInputContainer = $('[data-se="groups__add-group__roles-input"]');
  bSaveButton = $('[data-se="groups__add-group__save"]');
  bCancelButton = $('[data-se="groups__add-group__cancel"]');
  cErrorNotification = $('[data-se="groups__add-group__error"]');

  async get() {
    await helper.safeGet('/infra/manage-access/groups');
  }

  getGroupname(container) {
    return container.$('[data-se="groups__groups-list__groupname"]');
  }

  getMenu(container) {
    return container.$('[data-se="groups__groups-list__row-menu"]');
  }

  getMenuItems(container) {
    return container.$$('[data-se="groups__groups-list__row-menu-items"]');
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
