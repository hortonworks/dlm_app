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
  cBlockClusters = $('[data-se="onboard__after_idp__cluster_add"]');
  cBlockUsers = $('[data-se="onboard__after_idp__users"]');
  cBlockServices = $('[data-se="onboard__after_idp__services"]');
  bStart = $('[data-se="onboard__after_idp__start"]');
}
