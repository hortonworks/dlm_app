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

import {SignInPage} from '../../core/sign-in.po';
import {IdentityComponent} from '../../components/identity.po';
import {UsersListPage} from './users-list.po';
import {helper} from '../../utils/helpers';
import {GroupsListPage} from './groups-list.po';
import {browser} from 'protractor';
describe('Users page', function () {

  let page: UsersListPage;
  let loginPage: SignInPage;
  let identityComponent: IdentityComponent;

  beforeAll(async () => {
    loginPage = await SignInPage.get();
    await loginPage.justSignIn();
  });

  beforeEach(async () => {
    page = new UsersListPage();
    await page.get();
    await helper.waitForElement(page.bAdduser, 5000);
  });

  it('Should display list of users on load', async () => {
    await helper.waitForElement(page.cUsersList.first());
    expect(await page.cUsersList.first().isDisplayed()).toBeTruthy();
  });

  it('Should load groups page on click of groups tab', async () => {
    await helper.waitForElement(page.cTabs);
    await helper.waitForElement(page.getGroupsTab(page.cTabs));
    page.getGroupsTab(page.cTabs).click();
    let groupsPage = new GroupsListPage();
    await helper.waitForElement(groupsPage.cTabs);
    expect(await groupsPage.cTabs.isDisplayed()).toBeTruthy();
  });

  it('Show Add User slider on click of add user button', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
  });

  it('Close the Add User slider on click of cancel', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bCancelButton);
    await page.bCancelButton.click();
    expect(await page.cAdduserSlider.isPresent()).toBeFalsy();
  });

  it('Show user options when user name is typed', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cUsersInputContainer);
    await helper.waitForElement(page.getInputElement(page.cUsersInputContainer));
    await page.getInputElement(page.cUsersInputContainer).sendKeys('sam');
    await helper.waitForElement(page.getDropDown(page.cUsersInputContainer), 5000);
    expect(await page.getDropDown(page.cUsersInputContainer).isDisplayed()).toBeTruthy();
  });

  it('Should add the clicked option from the user drop down as a tag', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cUsersInputContainer);
    await helper.waitForElement(page.getInputElement(page.cUsersInputContainer));
    await page.getInputElement(page.cUsersInputContainer).sendKeys('sam');
    await helper.waitForElement(page.getDropDown(page.cUsersInputContainer), 5000);
    expect(await page.getDropDown(page.cUsersInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cUsersInputContainer).first());
    page.getTagOptions(page.cUsersInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cUsersInputContainer).first(), 2000);
    expect(await page.getTags(page.cUsersInputContainer).first().isDisplayed()).toBeTruthy();
  });

  it('Should add the clicked option from the roles drop down as a tag', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getInputElement(page.cUsersInputContainer));
    await helper.waitForElement(page.cRolesInputContainer);
    await helper.waitForElement(page.getInputElement(page.cRolesInputContainer));
    await page.getInputElement(page.cRolesInputContainer).click();
    await page.getInputElement(page.cRolesInputContainer).sendKeys('Data');
    await helper.waitForElement(page.getDropDown(page.cRolesInputContainer), 6000);
    expect(await page.getDropDown(page.cRolesInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cRolesInputContainer).first());
    page.getTagOptions(page.cRolesInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cRolesInputContainer).first(), 2000);
    expect(await page.getTags(page.cRolesInputContainer).first().isDisplayed()).toBeTruthy();
  });

  it('Should save the user on click of save button', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cUsersInputContainer);
    await helper.waitForElement(page.getInputElement(page.cUsersInputContainer));
    await page.getInputElement(page.cUsersInputContainer).sendKeys('sam');
    await helper.waitForElement(page.getDropDown(page.cUsersInputContainer), 5000);
    expect(await page.getDropDown(page.cUsersInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cUsersInputContainer).first());
    page.getTagOptions(page.cUsersInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cUsersInputContainer).first(), 2000);
    expect(await page.getTags(page.cUsersInputContainer).first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cRolesInputContainer);
    await helper.waitForElement(page.getInputElement(page.cRolesInputContainer));
    await page.getInputElement(page.cRolesInputContainer).click();
    await page.getInputElement(page.cRolesInputContainer).sendKeys('Data');
    await helper.waitForElement(page.getDropDown(page.cRolesInputContainer), 6000);
    expect(await page.getDropDown(page.cRolesInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cRolesInputContainer).first());
    page.getTagOptions(page.cRolesInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cRolesInputContainer).first(), 2000);
    expect(await page.getTags(page.cRolesInputContainer).first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bSaveButton);
    await page.bSaveButton.click();
    await helper.waitForElement(page.bAdduser);
    browser.sleep(5000);
    expect(await page.bSaveButton.isPresent()).toBeFalsy();
  });

  it('Shows error if username field is empty on save', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cUsersInputContainer);
    browser.sleep(5000);
    await helper.waitForElement(page.cRolesInputContainer);
    await helper.waitForElement(page.getInputElement(page.cRolesInputContainer));
    await page.getInputElement(page.cRolesInputContainer).click();
    await page.getInputElement(page.cRolesInputContainer).sendKeys('Data');
    await helper.waitForElement(page.getDropDown(page.cRolesInputContainer), 6000);
    expect(await page.getDropDown(page.cRolesInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cRolesInputContainer).first());
    page.getTagOptions(page.cRolesInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cRolesInputContainer).first(), 2000);
    expect(await page.getTags(page.cRolesInputContainer).first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bSaveButton);
    await page.bSaveButton.click();
    await helper.waitForElement(page.cErrorNotification);
    expect(await page.cErrorNotification.isDisplayed()).toBeTruthy();
  });

  it('Shows error if roles field is empty on save', async () => {
    await helper.waitForElement(page.bAdduser);
    await page.bAdduser.click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getInputElement(page.cUsersInputContainer));
    await page.getInputElement(page.cUsersInputContainer).sendKeys('sam');
    await helper.waitForElement(page.getDropDown(page.cUsersInputContainer), 5000);
    expect(await page.getDropDown(page.cUsersInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cUsersInputContainer).first());
    page.getTagOptions(page.cUsersInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cUsersInputContainer).first(), 2000);
    expect(await page.getTags(page.cUsersInputContainer).first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bSaveButton);
    await page.bSaveButton.click();
    expect(await page.cErrorNotification.isDisplayed()).toBeTruthy();
  });

  it('Should open edit on click of Edit option in the menu', async () => {
    await helper.waitForElement(page.cUsersList.first());
    expect(await page.cUsersList.first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getUsername(page.cUsersList.first()));
    await page.getUsername(page.cUsersList.first()).click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getMenu(page.cUsersList.first()));
    await page.getMenu(page.cUsersList.first()).click();
    await helper.waitForElement(page.getMenuItems(page.getMenu(page.cUsersList.first())).first());
    await page.getMenuItems(page.getMenu(page.cUsersList.first())).first().click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
  });

  it('Should open edit on click of username form the table', async () => {
    await helper.waitForElement(page.cUsersList.first());
    expect(await page.cUsersList.first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getUsername(page.cUsersList.first()));
    await page.getUsername(page.cUsersList.first()).click();
    await helper.waitForElement(page.cAdduserSlider);
    expect(await page.cAdduserSlider.isDisplayed()).toBeTruthy();
  });

  afterAll(helper.cleanup);

});
