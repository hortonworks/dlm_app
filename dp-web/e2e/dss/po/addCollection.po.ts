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

export class AddCollectionPage {

	bCancleOnInfo = $('[data-se="ds_editor_info_cancle"]');
	bNextOnInfo = $('[data-se="ds_editor_info_next"]');
	iName = $('[data-se="ds_editor_info_name"]');
	iDesc = $('[data-se="ds_editor_info_description"]');
	oFirstLake = $('[data-se="ds_editor_lake_optn_1"]');

	bAddAsset = $('[data-se="ds_editor_asset_holder_add"]');

	tAdvAssetSearch = $('[data-se="asset_search_tab_advanced"]');
	tAdvBasicSearch = $('[data-se="asset_search_tab_basic"]');
	oCommentsFilter = $('[data-se="advanced_search_filter_option_1"]');
	oNEFilterOperator = $('[data-se="advanced_search_filter_operator_select"] option[value="3"]');
	iFilterValue = $('[data-se="advanced_search_filter_value_input"]');

	bSearchOnPopup = $('[data-se="asset_selection_search"]');
	oPageSize100 = $('[data-se="asset_list_pagination"] option[value="100"]');

	selectableNames = $$('[data-se="ds_asset_list_itm_selectable"]');

	iBasicSearchInput = $('[data-se="basic_query_editor_search_input"]');
	bDoneAssetSelection = $('[data-se="asset_selection_popup_done"]');

	bNextOnAssetHolder = $('[data-se="ds_editor_asset_holder_next"]');

	bSummarySave = $('[data-se="asset_collection_summary_save"]');

	collName = "";
	collDesc = "";
    static async get() {
//    	await helper.safeGet('/datasteward/collections/add');
    	await helper.waitForElement($('[data-se="create_collection_nav_stage1"]'));
    	return new AddCollectionPage();
  	}
  	async cancleOnInfoStage () {
  		await helper.waitForElement(this.bCancleOnInfo);
  		await this.bCancleOnInfo.click();
  	}
  	async nextOnInfoStage () {
  		await helper.waitForElement(this.bNextOnInfo);
  		await this.bNextOnInfo.click();
  	}
  	async fillRandomName () {
  		await this.fillName("n_"+(new Date()).getTime());
  	}
  	async fillName(name) {
  		this.collName = name;
  		await this.iName.sendKeys(name);
  	}
  	async fillRandomDescription () {
  		this.collDesc="n_"+(new Date()).getTime();
  		await this.iDesc.sendKeys(this.collDesc);
  	}
  	async selectFirstLakeOption () {
  		await helper.waitForElement(this.oFirstLake);
  		await this.oFirstLake.click();
  	}
  	async invokeAddAsset () {
  		await helper.waitForElement(this.bAddAsset);
  		await this.bAddAsset.click();
  	}
  	async loadAdvSearch () {
  		await helper.waitForElement(this.tAdvAssetSearch);
  		await this.tAdvAssetSearch.click();
  	}
  	async showFirst100Results () {
  		await helper.waitForElement(this.oCommentsFilter, 5000);
  		await this.oCommentsFilter.click();
  		await helper.waitForElement(this.oNEFilterOperator);
  		await this.oNEFilterOperator.click();
  		let cmnt="n_"+(new Date()).getTime();
  		await this.iFilterValue.sendKeys(cmnt);
  		await this.bSearchOnPopup.click();
		await helper.waitForElement(this.oPageSize100);
  		await this.oPageSize100.click();
  	}
  	async getFirstSelectableName () {
  		await helper.waitForElements(this.selectableNames, 5000);
  		return (await this.selectableNames.first()).getText();
  	}
  	async loadBasicSearch () {
  		await helper.waitForElement(this.tAdvBasicSearch);
  		await this.tAdvBasicSearch.click();
  	}
  	async sendKeysToBasicSearch (key:string) {
  		await this.iBasicSearchInput.sendKeys(key);
  	}
  	async doneAssetSelection() {
  	  	await helper.waitForElement(this.bDoneAssetSelection);
  		await this.bDoneAssetSelection.click();
  	}
  	async doneAssetHOlder() {
  	  	await helper.waitForElement(this.bNextOnAssetHolder);
  		await this.bNextOnAssetHolder.click();
  	}
  	async saveAssetCollection() {
  	  	await helper.waitForElement(this.bSummarySave);
  		await this.bSummarySave.click();
  	}

}