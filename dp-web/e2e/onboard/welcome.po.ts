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

import { $ } from 'protractor';
import { helper } from '../utils/helpers';

export class WelcomePage {
  cBlockAuth = $('[data-se="onboard__welcome__auth"]');
  cBlockUsers = $('[data-se="onboard__welcome__users"]');
  bStart = $('[data-se="onboard__welcome__start"]');

  private constructor() {}

  static async get() {
    await helper.waitForElement($('[data-se="onboard__welcome__auth"]'));
    return new WelcomePage();
  }
}
