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
import { helper } from '../utils/helpers';

export class DatasetDashboardPage {
    private bModeList = $('[data-se="collection_dashboard__mode_list"]');
    private bModeTile = $('[data-se="collection_dashboard__mode_tile"]');

    private fCollectionFilter = $('[data-se="collection_dashboard__filter"]');

    private bCreateCollection = $('[data-se="collection_dashboard__create"]');

    private fTagsFilter = $('[data-se="collection_tags__filter"]');

    private cCollections = $$('[data-se-group=]')

    async get() {
        await helper.safeGet('/datasteward/collections');
    }

    async doSwitchModeToList() {
      await helper.waitForElement(this.bModeList);
      await this.bModeList.click();
    }

    async doSwitchModeToGrid() {
      await helper.waitForElement(this.bModeTile);
      await this.bModeTile.click();
    }

    async doFilterCollections(key: string) {
      await helper.waitForElement(this.fCollectionFilter);
      await this.fCollectionFilter.sendKeys(key);
    }

    async doFilterCollectionTags(key: string) {
      await helper.waitForElement(this.fTagsFilter);
      await this.fTagsFilter.sendKeys(key);
    }

    async doNaviagateToCreateCollection() {
      await helper.waitForElement(this.fTagsFilter);
      await this.fTagsFilter.click();
    }
}
