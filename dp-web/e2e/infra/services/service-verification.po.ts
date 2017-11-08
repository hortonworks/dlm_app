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

import {browser, $, $$} from 'protractor';
import {helper} from '../../utils/helpers';

export class ServiceVerificationPage {

  public iSmartSenseInput = $('[data-se="services__verification-smart-sense-id"]');
  public bVerifyButton = $('[data-se="services__verification-verify-button"]');
  public tIncorrectSmartSenseId = $('[data-se="services__verification-incorrect-smart-sense-id"]');
  public bVerifiedButton = $('[data-se="services__verification-verified-button"]');
  public bNextButton = $('[data-se="services__verification-next-button"]');
  public bCancelButton = $('[data-se="services__verification-cancel-button"]');
  public cErrorNotificationBar = $('[data-se="services__verification-error-notification"]');

  async getVerificationPage() {
    await helper.safeGet('/infra/services/dlm/verify');
  }

  async setSmartSenseId(smartSenseId) {
    await helper.waitForElement(this.iSmartSenseInput);
    await this.iSmartSenseInput.sendKeys(smartSenseId);
  }

  async doVerify() {
    await helper.waitForElement(this.bVerifyButton);
    await this.bVerifyButton.click();
  }

  async doNext() {
    await helper.waitForElement(this.bNextButton);
    await this.bNextButton.click();
  }


}
