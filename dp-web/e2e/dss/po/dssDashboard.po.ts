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

import { $, $$ } from 'protractor';
import { helper } from '../../utils/helpers';
import {browser} from 'protractor';

export class DatasetDashboardPage {
    bModeList = $('[data-se="collection_dashboard__mode_list"]');
    bModeTile = $('[data-se="collection_dashboard__mode_tile"]');

    fCollectionFilter = $('[data-se="collection_dashboard__filter"]');

    bCreateCollection = $('[data-se="collection_dashboard__create"]');

    fTagsFilter = $('[data-se="collection_tags__filter"]');

    cCollections = $$('[data-se-group=]');
    lCollectionNames = $$('[data-se="dashboard_collection_list_itm_name"]');
    lCollectionActions = $$('[data-se="dashboard_collection_actions"]');

    bDeleteCollection = $('[data-se="dashboard_collection_action_delete"]');

    sDeleteConfirmCollecName = $('[data-se="delete_collection_confirmation_msg"] span');
    bDeleteConfirmCancle = $('[data-se="delete_collection_confirmation_cancel"]');
    bDeleteCollConfirm = $('[data-se="delete_collection_confirm"]');

    static async navigate() {
    	await helper.safeGet('/datasteward/collections');
    	return DatasetDashboardPage.get();
    }

    async letPageLoad(waitTime:number) {
    	await helper.waitForElement(this.bCreateCollection, waitTime);
    }

    static async get() {
    	await helper.waitForElement($('[data-se="collection_dashboard__create"]'));
    	return new DatasetDashboardPage();
  	}

    async naviagateToCreateCollection() {
      await helper.waitForElement(this.bCreateCollection);
      await this.bCreateCollection.click();
    }

    async searchCollectionByName(name) {
		await this.fCollectionFilter.sendKeys(name);
    }
    async letCollectionListLoad () {
    	await helper.waitForElements(this.lCollectionNames, 5000);
    }
    async getFirstCollectionName() {
    	return (await this.lCollectionNames.first()).getText();
    }
    async clickFirstCollectionDelete() {
    	let elm = await this.lCollectionActions.first()
    	await browser.sleep(1000);
    	browser.executeScript("arguments[0].scrollIntoView();", elm.getWebElement());
    	await browser.sleep(1000);
    	await (elm).click();
    	await helper.waitForElement(this.bDeleteCollection);
    	await this.bDeleteCollection.click();
    }
    async getDeleteConfirmCollectionName() {
    	await helper.waitForElement(this.sDeleteConfirmCollecName);
    	return this.sDeleteConfirmCollecName.getText();
    }
    async cancleDeleteConfirmation() {
      await helper.waitForElement(this.bDeleteConfirmCancle);
      await this.bDeleteConfirmCancle.click();    	
    }
    async confirmDeleteConfirmation() {
      await helper.waitForElement(this.bDeleteCollConfirm);
      await this.bDeleteCollConfirm.click();    	
    }
}
