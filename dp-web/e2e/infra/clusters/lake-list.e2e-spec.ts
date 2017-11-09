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
import {browser} from "protractor";
import {SignInPage} from "../../core/sign-in.po";
import {ClusterAddPage} from "./cluster-add.po";
import {clusterAddData, lakeList} from "../../data";
import {protractor} from "protractor/built/ptor";


describe('lake-list page\n', function() {
  let page: LakeListPage;
  let loginPage: SignInPage;
  let clusterAddPage: ClusterAddPage;
  let RETRIEVE_CLUSTER_TIMEOUT_MS=25000; //increase it if test cases timeout
  let WAIT_TIME_MS=3000;

  beforeAll(async() => {
    await browser.sleep(1000); //Increase it if knox opens
    loginPage = await SignInPage.get();
    await loginPage.justSignIn();
    await browser.sleep(1000); // its needed for now. else knox page opens and that throws error. Increase it if knox opens
    clusterAddPage = new ClusterAddPage();
    await clusterAddPage.get();
    await clusterAddPage.inputAmbariUrl(lakeList.ambariUrl1); //make sure this IP is valid and NOT already added
    await clusterAddPage.clickGo();
    await helper.waitForElement(clusterAddPage.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

    await clusterAddPage.fillClusterLocation(clusterAddData.locationPre);
    await clusterAddPage.fillDataCenter(clusterAddData.dataCenter1);
    await clusterAddPage.fillTags(clusterAddData.tagSingle);
    await clusterAddPage.fillDescription(clusterAddData.description);
    await clusterAddPage.addCluster();
  });

  beforeEach(async () => {
    page = await LakeListPage.get();
  });

  it('should go to cluster edit page', async () => {
    await page.clickDropDown();
    await helper.waitForElement(page.cEdit,WAIT_TIME_MS);
    await page.cEdit.click();

    await helper.waitForElement(page.tEditLabel);
    expect(await page.tEditLabel.isDisplayed()).toBeTruthy();
  });

  it('ambari link should be present', async () => {
    await page.clickDropDown();
    await helper.waitForElement(page.lAmbariLink,WAIT_TIME_MS);

    await page.lAmbariLink.getAttribute('href').then(await function (linkText) {
      expect(linkText).toContain(":8080");
    })
  });

  // it('uptime should change and new (absolute) uptime value should be larger', async () => { // this test case will fail if DP fails to fetch health info of cluster.
  //   await page.clickDropDown();
  //
  //   let uptimeMs: number;
  //   await helper.waitForElement(page.bDropDownEn);
  //   await page.bDropDownEn.getAttribute('data-se-value').then(await function(upTimeText){
  //     uptimeMs = Math.abs(Number(upTimeText));
  //   });
  //
  //   await helper.waitForElement(page.cRefresh,WAIT_TIME_MS);
  //   await page.cRefresh.click();
  //
  //   let refreshedUptimeMs: number;
  //   let EC = protractor.ExpectedConditions;
  //
  //   try{
  //     await browser.wait(EC.invisibilityOf(page.bDropDownEn),RETRIEVE_CLUSTER_TIMEOUT_MS);
  //     await helper.waitForElement(page.bDropDownEn,WAIT_TIME_MS);
  //     await browser.wait(async function() {
  //       const upTimeText = await page.bDropDownEn.getAttribute('data-se-value');
  //       return uptimeMs < Math.abs(Number(upTimeText));
  //     }, RETRIEVE_CLUSTER_TIMEOUT_MS);
  //     const upTimeText = await page.bDropDownEn.getAttribute('data-se-value');
  //     refreshedUptimeMs = Math.abs(Number(upTimeText));
  //     expect(uptimeMs < refreshedUptimeMs).toBeTruthy();
  //
  //   } catch(e){
  //     const upTimeText = await page.bDropDownEn.getAttribute('data-se-value')
  //     refreshedUptimeMs = Math.abs(Number(upTimeText));
  //     expect(uptimeMs < refreshedUptimeMs).toBeTruthy();
  //   }
  // });

  it('delete confirmation box should appear', async () => {
    await page.clickDropDown();
    await helper.waitForElement(page.cRemove,WAIT_TIME_MS);
    await page.cRemove.click();

    await helper.waitForElement(page.bCancelButton,WAIT_TIME_MS);
    expect(await page.bCancelButton.isDisplayed()).toBeTruthy();
  });

  it('cancel button should abort the process of deletion', async () => {
    await page.clickDropDown();
    await helper.waitForElement(page.cRemove,WAIT_TIME_MS);
    await page.cRemove.click();

    await helper.waitForElement(page.bCancelButton,WAIT_TIME_MS);
    await page.bCancelButton.click();
    await helper.waitForElement(page.bDropDownEn,WAIT_TIME_MS);
    expect(await page.bDropDownEn.isDisplayed()).toBeTruthy();
  });

  it('delete button should delete the respective cluster', async () => {
    await page.clickDropDown();
    await helper.waitForElement(page.cRemove,WAIT_TIME_MS);
    await page.cRemove.click();

    await helper.waitForElement(page.bDeleteButton,WAIT_TIME_MS);
    await page.bDeleteButton.click();
    var EC = protractor.ExpectedConditions;
    expect(EC.invisibilityOf(page.bDropDownEn)).toBeTruthy();
  });

  afterAll(async() => {
    helper.cleanup;
  })
});
