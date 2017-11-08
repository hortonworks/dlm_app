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
describe('Groups page', function () {

  let page: GroupsListPage;
  let loginPage: SignInPage;
  let identityComponent: IdentityComponent;

  beforeAll(async () => {
    loginPage = await SignInPage.get();
    await loginPage.justSignIn();
  });

  beforeEach(async () => {
    page = new GroupsListPage();
    await page.get();
    await helper.waitForElement(page.bAddgroup, 5000);
  });

  it('Should display list of groups on load', async () => {
    await helper.waitForElement(page.cGroupsTable);
    expect(await page.cGroupsTable.isDisplayed()).toBeTruthy();
  });

  it('Should load user page on click of users tab', async () => {
    await helper.waitForElement(page.cTabs);
    await helper.waitForElement(page.getGroupsTab(page.cTabs));
    page.getGroupsTab(page.cTabs).click();
    let usersPage = new UsersListPage();
    await helper.waitForElement(usersPage.cTabs);
    expect(await usersPage.cTabs.isDisplayed()).toBeTruthy();
  });

  it('Show Add Group slider on click of add group button', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
  });

  it('Close the Add Group slider on click of cancel', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bCancelButton);
    await page.bCancelButton.click();
    expect(await page.cAddgroupSlider.isPresent()).toBeFalsy();
  });

  it('Show group options when group name is typed', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cGroupsInputContainer);
    await helper.waitForElement(page.getInputElement(page.cGroupsInputContainer));
    await page.getInputElement(page.cGroupsInputContainer).sendKeys('scien');
    await helper.waitForElement(page.getDropDown(page.cGroupsInputContainer), 5000);
    expect(await page.getDropDown(page.cGroupsInputContainer).isDisplayed()).toBeTruthy();
  });

  it('Should add the clicked option from the group drop down as a tag', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cGroupsInputContainer);
    await helper.waitForElement(page.getInputElement(page.cGroupsInputContainer));
    await page.getInputElement(page.cGroupsInputContainer).sendKeys('scien');
    await helper.waitForElement(page.getDropDown(page.cGroupsInputContainer), 5000);
    expect(await page.getDropDown(page.cGroupsInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cGroupsInputContainer).first());
    page.getTagOptions(page.cGroupsInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cGroupsInputContainer).first(), 2000);
    expect(await page.getTags(page.cGroupsInputContainer).first().isDisplayed()).toBeTruthy();
  });

  it('Should add the clicked option from the roles drop down as a tag', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getInputElement(page.cGroupsInputContainer));
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

  it('Should save the group on click of save button', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cGroupsInputContainer);
    await helper.waitForElement(page.getInputElement(page.cGroupsInputContainer));
    await page.getInputElement(page.cGroupsInputContainer).sendKeys('scien');
    await helper.waitForElement(page.getDropDown(page.cGroupsInputContainer), 5000);
    expect(await page.getDropDown(page.cGroupsInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cGroupsInputContainer).first());
    page.getTagOptions(page.cGroupsInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cGroupsInputContainer).first(), 2000);
    expect(await page.getTags(page.cGroupsInputContainer).first().isDisplayed()).toBeTruthy();
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
    await helper.waitForElement(page.bAddgroup);
    browser.sleep(5000);
    expect(await page.bSaveButton.isPresent()).toBeFalsy();
  });

  it('Shows error if groupname field is empty on save', async () => {
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.cGroupsInputContainer);
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
    await helper.waitForElement(page.bAddgroup);
    await page.bAddgroup.click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getInputElement(page.cGroupsInputContainer));
    await page.getInputElement(page.cGroupsInputContainer).sendKeys('scien');
    await helper.waitForElement(page.getDropDown(page.cGroupsInputContainer), 5000);
    expect(await page.getDropDown(page.cGroupsInputContainer).isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getTagOptions(page.cGroupsInputContainer).first());
    page.getTagOptions(page.cGroupsInputContainer).first().click();
    await helper.waitForElement(page.getTags(page.cGroupsInputContainer).first(), 2000);
    expect(await page.getTags(page.cGroupsInputContainer).first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.bSaveButton);
    await page.bSaveButton.click();
    expect(await page.cErrorNotification.isDisplayed()).toBeTruthy();
  });

  it('Should open edit on click of Edit option in the menu', async () => {
    await helper.waitForElement(page.cGroupsList.first());
    expect(await page.cGroupsList.first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getGroupname(page.cGroupsList.first()));
    await page.getGroupname(page.cGroupsList.first()).click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getMenu(page.cGroupsList.first()));
    await page.getMenu(page.cGroupsList.first()).click();
    await helper.waitForElement(page.getMenuItems(page.getMenu(page.cGroupsList.first())).first());
    await page.getMenuItems(page.getMenu(page.cGroupsList.first())).first().click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
  });

  it('Should open edit on click of groupname form the table', async () => {
    await helper.waitForElement(page.cGroupsList.first());
    expect(await page.cGroupsList.first().isDisplayed()).toBeTruthy();
    await helper.waitForElement(page.getGroupname(page.cGroupsList.first()));
    await page.getGroupname(page.cGroupsList.first()).click();
    await helper.waitForElement(page.cAddgroupSlider);
    expect(await page.cAddgroupSlider.isDisplayed()).toBeTruthy();
  });

  afterAll(helper.cleanup);

});
