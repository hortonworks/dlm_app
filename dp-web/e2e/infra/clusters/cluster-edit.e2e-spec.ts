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

import { helper } from '../../utils/helpers';
import {LakeListPage} from "./lake-list.po";
import {$, browser} from "protractor";
import {SignInPage} from "../../core/sign-in.po";
import {ClusterAddPage} from "./cluster-add.po";
import {clusterAddData, lakeList} from "../../data";
import {protractor} from "protractor/built/ptor";
import {ClusterEditPage} from "./cluster-edit.po";
import {SetUp} from "../../setUp";


describe('Cluster-edit page\n', function() {
  let page: ClusterEditPage;
  let loginPage: SignInPage;
  let clusterAddPage: ClusterAddPage;
  let lakeListPage: LakeListPage;
  let RETRIEVE_CLUSTER_TIMEOUT_MS=35000; //increase it if test cases timeout
  let WAIT_TIME_MS=3000;
  let clusterEditLink: string;
  //let setup: SetUp;

  beforeAll(async() => {
    await SetUp.signIn();
    clusterAddPage = new ClusterAddPage();
    // await clusterAddPage.get();
    // await clusterAddPage.inputAmbariUrl(lakeList.ambariUrl1); //make sure this IP is valid and NOT already added
    // await clusterAddPage.clickGo();
    // await helper.waitForElement(clusterAddPage.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);
    //
    // await clusterAddPage.fillClusterLocation(clusterAddData.locationPre);
    // await clusterAddPage.fillDataCenter(clusterAddData.dataCenter1);
    // await clusterAddPage.fillTags(clusterAddData.tagSingle);
    // await clusterAddPage.fillDescription(clusterAddData.description);
    // await clusterAddPage.addCluster();
    lakeListPage = await LakeListPage.get();
    page = new ClusterEditPage();
    await lakeListPage.clickDropDown();
    await helper.waitForElement(lakeListPage.cEdit);
    clusterEditLink = await lakeListPage.cEdit.getAttribute('href');
    page.clusterEditLink = clusterEditLink;
    console.log("Cluster edit link '"+page.clusterEditLink+"'");
  });

  beforeEach(async () => {
    await page.get();
  });

  it('cancel button should work properly', async () => {
    await helper.waitForElement(page.bCancelButton);
    await page.bCancelButton.click();
    await helper.waitForElement(clusterAddPage.bAddButton,WAIT_TIME_MS);
    expect(clusterAddPage.bAddButton.isDisplayed()).toBeTruthy();
  });

  it('should update cluster location', async () => {
    await helper.waitForElement(page.fClusterLocation);
    let oldLocation = await page.fClusterLocation.getAttribute('value');
    let newLocationPre:string;
    let oldLocationPre = oldLocation.substring(0,3);
    if(oldLocationPre.toLowerCase() === 'cal'){
      newLocationPre = 'san';
    }else{
      newLocationPre = 'cal';
    }

    await page.fClusterLocation.click();
    await page.fClusterLocation.clear();
    await page.fClusterLocation.sendKeys(newLocationPre);
    await browser.sleep(2000); // may need this.
    await $('.item.selected').click();
    await helper.waitForElement(page.bUpdateButton);
    await page.bUpdateButton.click();
    await browser.sleep(500);

    await page.get();
    await helper.waitForElement(page.fClusterLocation,WAIT_TIME_MS);
    let newLocation = await page.fClusterLocation.getAttribute('value');

    expect((oldLocation !== newLocation) ).toBeTruthy();
  });

  it('should update tags associated with the cluster', async () => {
    await helper.waitForElement(page.tTags.last(),WAIT_TIME_MS);
    await helper.waitForElement(page.fTagsInput);
    let tagsCount = await page.tTags.count();

    await page.fTagsInput.click();
    await page.fTagsInput.sendKeys("tag2");
    await helper.waitForElement(page.bUpdateButton);
    await page.bUpdateButton.click();
    await browser.sleep(500);

    await page.get();
    await helper.waitForElement(page.tTags.last(),WAIT_TIME_MS);
    let newTagsCount = await page.tTags.count();

    expect(tagsCount < newTagsCount).toBeTruthy();
  });

  it('should update the description', async () => {
    await helper.waitForElement(page.tDescription,WAIT_TIME_MS);
    let description = await page.tDescription.getAttribute('value');
    await page.tDescription.click();
    await page.tDescription.clear();

    let date = new Date();
    let timeStamp = date.getTime();
    await page.tDescription.sendKeys("desc_"+timeStamp);

    await helper.waitForElement(page.bUpdateButton);
    await  page.bUpdateButton.click();

    await page.get();
    await helper.waitForElement(page.tDescription,WAIT_TIME_MS);
    let newDescription = await page.tDescription.getAttribute('value');
    expect(description !== newDescription).toBeTruthy();
  });

  it('should show invalid location error (as location field value is not valid)', async () => {
    await helper.waitForElement(page.fClusterLocation,WAIT_TIME_MS);

    await page.fClusterLocation.click();
    await page.fClusterLocation.clear();
    await page.fClusterLocation.sendKeys("garbage_123455");

    await helper.waitForElement(page.bUpdateButton);
    await page.bUpdateButton.click();

    await helper.waitForElement(page.tLocationError);
    expect(page.tLocationError.isDisplayed()).toBeTruthy();
  });

  afterAll(async() => {
    helper.cleanup;
  })
});
