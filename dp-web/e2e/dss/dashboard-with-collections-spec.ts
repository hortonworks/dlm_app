
import { SignInPage } from '../core/sign-in.po';
import { helper } from '../utils/helpers';
import { DatasetDashboardPage } from './po/dssDashboard.po';
import { AddCollectionPage } from './po/addCollection.po';
import {browser} from 'protractor';

describe('DSS Dashboard Page With Collections', function() {
	let page: DatasetDashboardPage;
	let addColPage: AddCollectionPage;
    let firstCollName : string;
	beforeAll(async () => {
		const authPage = await SignInPage.get();
		await authPage.justSignIn();
		page = await DatasetDashboardPage.navigate();
    });

    it('Invoke and cancle delete asset collection', async () => {
    	firstCollName = await page.getFirstCollectionName();
        await page.clickFirstCollectionDelete();
        expect(page.getDeleteConfirmCollectionName()).toEqual(firstCollName);
        await page.cancleDeleteConfirmation();
        expect(page.getFirstCollectionName()).toEqual(firstCollName);
    })

    it('Invoke and confirm delete asset collection', async () => {
        firstCollName = await page.getFirstCollectionName();
        await page.clickFirstCollectionDelete();
        await page.confirmDeleteConfirmation();
        await page.letCollectionListLoad();

    })
    
    afterAll(helper.cleanup);

})