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


import {$, browser} from "protractor";
import {lakeList} from "../../data";
import {helper} from "../../utils/helpers";

export class LakeListPage {
  public ambariLinkSeString = "lake_list__goTo_"+lakeList.ambariUrl1;
  public dropDownEnabledSeString = "lake_list__dropDownEn_"+lakeList.ambariUrl1;
  public refreshSeString = "lake_list__refresh_"+lakeList.ambariUrl1;
  public editSeString = "lake_list__edit_"+lakeList.ambariUrl1;
  public removeSeString = "lake_list__remove_"+lakeList.ambariUrl1;
  public DROP_DOWN_ENABLED_TIME_MS = 25000; //wait for given time for drop down to get enabled

  public bDropDownEn = $(`[data-se="${this.dropDownEnabledSeString}"]`);
  public tEditLabel = $(`[data-se="cluster_edit__editLabel"]`);
  public lAmbariLink = $(`[data-se="${this.ambariLinkSeString}"]`);
  public cRefresh = $(`[data-se="${this.refreshSeString}"]`);
  public cRemove = $(`[data-se="${this.removeSeString}"]`);
  public cEdit = $(`[data-se="${this.editSeString}"]`);
  public bCancelButton = $('[data-se="common_util__cancelButton"]');
  public bDeleteButton = $('[data-se="common_util__warningDeleteButton"]');

  static async get() {
    const page = await new LakeListPage();
    await helper.safeGet('/infra/clusters');
    return page;
  }

  async clickDropDown() {
    await browser.driver.sleep(1000);
    await helper.waitForElement(this.bDropDownEn,this.DROP_DOWN_ENABLED_TIME_MS);
    await this.bDropDownEn.click();
    await browser.driver.sleep(1000);
  }

  async
}
