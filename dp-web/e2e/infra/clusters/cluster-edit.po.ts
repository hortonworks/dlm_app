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


import {$, $$, browser} from "protractor";
import {lakeList} from "../../data";
import {helper} from "../../utils/helpers";

export class ClusterEditPage {
  public clusterEditLink:string;
  public bUpdateButton = $('[data-se="cluster_edit__updateButton"]');
  public bCancelButton = $('[data-se="cluster_edit__cancelButton"]');
  public fClusterLocation = $('[data-se="cluster_edit__location"]');
  public fTagsInput = $('[data-se="common__taggingWidget__tagInput"]');
  public tDescription = $('[data-se="cluster_edit__description"]');
  public tTags = $$('[data-se-group="common__tagging-widget__tags"]');
  public tLocationError = $('[data-se="cluster_edit__locationError"]');

  async get() {
    await helper.safeGet(this.clusterEditLink);
  }

}
