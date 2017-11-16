
import { SignInPage } from '../core/sign-in.po';
import { helper } from '../utils/helpers';
import { DatasetDashboardPage } from './po/dssDashboard.po';
import { AddCollectionPage } from './po/addCollection.po';


describe('DSS Dashboard Page', function() {
	let page: DatasetDashboardPage;
	let addColPage: AddCollectionPage;
	beforeAll(async () => {
		const authPage = await SignInPage.get();
		await authPage.justSignIn();
		page = await DatasetDashboardPage.navigate();
    });

    it('Should display add asset collection button', async () => {
        await helper.waitForElement(page.bCreateCollection);
        expect(await page.bCreateCollection.isDisplayed()).toBeTruthy();
    });

    it('Invoke and cancle add asset collection flow', async () => {
    	await page.naviagateToCreateCollection();
    	addColPage = await AddCollectionPage.get();
    	await addColPage.cancleOnInfoStage();
    	await helper.waitForElement(page.bCreateCollection);
        expect(await page.bCreateCollection.isDisplayed()).toBeTruthy();
    })
    
    afterAll(helper.cleanup);

})