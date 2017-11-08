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
import {ClusterAddPage} from "./cluster-add.po";
import {browser} from "protractor";
import {SignInPage} from "../../core/sign-in.po";
import {clusterAddData} from "../../data";

describe('cluster-add page', function() {
    let page: ClusterAddPage;
    let loginPage: SignInPage;
    let RETRIEVE_CLUSTER_TIMEOUT_MS=6000; //increase it if test cases timeout

    beforeAll(async() => {
      await browser.sleep(1000); //Increase it if knox opens
      loginPage = await SignInPage.get();
      loginPage.justSignIn();
      await browser.sleep(1000); // its needed for now. else knox page opens and that throws error. Increase it if knox opens
    })

    beforeEach(async () => {
        page = new ClusterAddPage();
        await page.get();
    });

    it('should display error message for invalid ambari url', async () => {
        await page.inputAmbariUrl(clusterAddData.inValidAmbariUrl);
        await page.clickGo();

        await helper.waitForElement(page.tErrorMessage);
        await helper.expectEqualText(page.tErrorMessage,clusterAddData.inValidAmbariMsg);
    });

    it('should be valid and activate clear button', async () => {
        await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
        await page.clickGo();

        await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);
        expect(await page.bClearButton.isDisplayed()).toBeTruthy();
    });

    it('should give add error (network error)', async () => {
      await page.inputAmbariUrl(clusterAddData.notReachablrAmbari); // make sure this IP is NOT reachable
      await page.clickGo();

      await helper.waitForElement(page.tAddErrorMessage,RETRIEVE_CLUSTER_TIMEOUT_MS);
      await helper.expectEqualText(page.tAddErrorMessage,clusterAddData.ambariNetworkError);
    });

    it('should give add error (please fill all mandatory field) as cluster location is not filled', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.fillDataCenter(clusterAddData.dataCenter1);
      await page.addCluster();

      await helper.waitForElement(page.tAddErrorMessage);
      await helper.expectEqualText(page.tAddErrorMessage,clusterAddData.fillAllMandatoryFieldsMsg);
    });

    it('should give add error (please fill all mandatory field) as datacenter is not filled', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.fillClusterLocation(clusterAddData.locationPre);
      await page.addCluster();

      await helper.waitForElement(page.tAddErrorMessage);
      await helper.expectEqualText(page.tAddErrorMessage,clusterAddData.fillAllMandatoryFieldsMsg);
    });

    it('Test for clear button: Clear button should clear ambari Url and Go button should appear again', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.clickClear();

      await helper.waitForElement(page.bGoButton);
      expect(await page.bGoButton.isDisplayed()).toBeTruthy();
    });

    it('Test for Cancle button: on clicking cancel button , Lake list page should open', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.clickCancel();

      await helper.waitForElement(page.bAddButton);
      expect(await page.bAddButton.isDisplayed()).toBeTruthy();
    });

    it('should add the cluster to DP and should go to cluster list page', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl1); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.fillClusterLocation(clusterAddData.locationPre);
      await page.fillDataCenter(clusterAddData.dataCenter1);
      await page.fillTags(clusterAddData.tagSingle);
      await page.fillDescription(clusterAddData.description);
      await page.addCluster();

      // await helper.waitForUrl(clusterAddData.addSuccessUrl);
      // expect(await helper.urlChanged(clusterAddData.addSuccessUrl)).toBeTruthy();
      await helper.waitForElement(page.bAddButton);
      expect(await page.bAddButton.isDisplayed()).toBeTruthy();
    });

    it('should add the cluster to DP and stay at cluster add page with message "cluster added successfully"', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl2); //make sure this IP is valid and NOT already added
      await page.clickGo();
      await helper.waitForElement(page.bClearButton,RETRIEVE_CLUSTER_TIMEOUT_MS);

      await page.fillClusterLocation(clusterAddData.locationPre);
      await page.fillDataCenter(clusterAddData.dataCenter2);
      await page.fillTags(clusterAddData.tagSingle);
      await page.fillDescription(clusterAddData.description);
      await page.addAndNewCluster();

      await helper.waitForElement(page.tAddSuccessMessage);
      await helper.expectEqualText(page.tAddSuccessMessage,clusterAddData.addSuccessMsg);
    });

    it('should display error message that cluster already exists', async () => {
      await page.inputAmbariUrl(clusterAddData.ambariUrl2);
      await page.clickGo();

      await helper.waitForElement(page.tErrorMessage,RETRIEVE_CLUSTER_TIMEOUT_MS);
      await helper.expectEqualText(page.tErrorMessage,clusterAddData.alreadyExistsmsg);
    });

    afterAll(helper.cleanup);
});
