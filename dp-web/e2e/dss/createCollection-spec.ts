
import { SignInPage } from '../core/sign-in.po';
import { helper } from '../utils/helpers';
import { DatasetDashboardPage } from './po/dssDashboard.po';
import { AddCollectionPage } from './po/addCollection.po';
import {browser} from 'protractor';


describe('DSS Add Collection Page', function() {
	let dashBoardpage: DatasetDashboardPage;
	let addColPage: AddCollectionPage;
	beforeAll(async () => {
		const authPage = await SignInPage.get();
		await authPage.justSignIn();
		dashBoardpage = await DatasetDashboardPage.navigate();
    });

    it('Collection creation without name or description or datalake must fail', async () => {
    	await dashBoardpage.naviagateToCreateCollection();
    	addColPage = await AddCollectionPage.get();
    	await addColPage.nextOnInfoStage();
    	expect(addColPage.bNextOnInfo.isDisplayed()).toBeTruthy();
    	await addColPage.fillRandomName();
    	await addColPage.nextOnInfoStage();
    	expect(addColPage.bNextOnInfo.isDisplayed()).toBeTruthy();
    	await addColPage.fillRandomDescription();
    	await addColPage.nextOnInfoStage();
    	expect(addColPage.bNextOnInfo.isDisplayed()).toBeTruthy();
    	await addColPage.selectFirstLakeOption();
    	// await browser.sleep(5000);
    	await addColPage.nextOnInfoStage();
    	expect(addColPage.bAddAsset.isDisplayed()).toBeTruthy();
    })

    it('Collection creation add asset, Asvanced search and Basic search', async () => {
    	await addColPage.invokeAddAsset();
    	await addColPage.loadAdvSearch();
    	await addColPage.showFirst100Results()
    	let name = await addColPage.getFirstSelectableName();
    	await addColPage.loadBasicSearch();
    	await addColPage.sendKeysToBasicSearch(name);
    	await addColPage.bSearchOnPopup.click();
    	expect(addColPage.getFirstSelectableName()).toEqual(name);
    	await addColPage.doneAssetSelection();
    	expect(addColPage.bNextOnAssetHolder.isDisplayed()).toBeTruthy();
    })

    it('Collection creation save', async () => {
    	await addColPage.doneAssetHOlder();
    	await addColPage.saveAssetCollection();
    	await dashBoardpage.letPageLoad(5000);
    	expect(dashBoardpage.bCreateCollection.isDisplayed()).toBeTruthy();
    })

    it('Validate newly created collection', async () => {    	
    	await dashBoardpage.searchCollectionByName(addColPage.collName);
    	await dashBoardpage.letCollectionListLoad();
    	expect(dashBoardpage.getFirstCollectionName()).toEqual(addColPage.collName);
    })

    it('Collection creation with duplicate name must fail', async () => {    	
    	await dashBoardpage.naviagateToCreateCollection();
    	await addColPage.fillName(addColPage.collName);
    	expect(addColPage.bNextOnInfo.getAttribute('disabled')).toBe(true);
    })


    afterAll(helper.cleanup);
})