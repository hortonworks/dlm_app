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

import {browser, $, element, by} from 'protractor';
import { helper } from '../../utils/helpers';

export class ClusterAddPage {
  public url = '';

  public cTitle = $('[data-se="cluster_add__title"');
  public bAddButton = $('[data-se="cluster_add__addButton"]');
  public bGoButton = $('[data-se="cluster_add__goButton"]');
  public tErrorMessage = $('[data-se="cluster_add__failReasons"]');
  public bClearButton = $('[data-se="cluster_add__clearButton"]');
  public fAmbariUrlInput = $('[data-se="cluster_add__ambariUrlInput"]');
  public tAddErrorMessage = $('[data-se="cluster_add__addError"]');
  public fDataCenter = $('[data-se="cluster_add__dataCenter"]');
  public bAddClusterButton = $('[data-se="cluster_add__addClusterButton"]');
  public fClusterLocation = $('[data-se="cluster_add__location"]');
  public fTags = $('[data-se="common__taggingWidget__tagInput"]');
  public tDescription = $('[data-se="clsuter_add__description"]');
  public bAddAndNewButton = $('[data-se="cluster_add__addAndNewClusterButton"]');
  public tAddSuccessMessage = $('[data-se="cluster_add__addSuccess"]');
  public bCancelButton = $('[data-se="cluster_add__cancelButton"]');

  async get() {
      await helper.safeGet('/infra/clusters/add');
  }

  async inputAmbariUrl(ambariUrl: string){
    await helper.waitForElement(this.fAmbariUrlInput);
    await this.fAmbariUrlInput.sendKeys(ambariUrl);
  }

  async clickGo(){// as this call will take more time, use increased timeout in subsequent waitForElement()
    await helper.waitForElement(this.bGoButton)
    await this.bGoButton.click();
  }

  async addCluster(){
    await  helper.waitForElement(this.bAddClusterButton);
    await this.bAddClusterButton.click();
  }

  async addAndNewCluster(){
    await  helper.waitForElement(this.bAddAndNewButton);
    await this.bAddAndNewButton.click();
  }

  async fillDataCenter(datacenter:string){
    await helper.waitForElement(this.fDataCenter);
    await this.fDataCenter.sendKeys(datacenter);
  }

  async  fillClusterLocation(locationPre: string){
    await helper.waitForElement(this.fClusterLocation);
    await this.fClusterLocation.sendKeys(locationPre);

    await browser.sleep(1000); // may need this.
    await $('.item.selected').click();
  }

  async fillTags(tag:string){ // TBD: pass array of tags
    await  helper.waitForElement(this.fTags);
    await this.fTags.sendKeys(tag);
  }

  async fillDescription(desc:string){
    await helper.waitForElement(this.tDescription);
    await this.tDescription.sendKeys(desc);
  }

  async clickClear(){
    await helper.waitForElement(this.bClearButton);
    await this.bClearButton.click();
  }

  async clickCancel(){
    await helper.waitForElement(this.bCancelButton);
    await this.bCancelButton.click();
  }

}
