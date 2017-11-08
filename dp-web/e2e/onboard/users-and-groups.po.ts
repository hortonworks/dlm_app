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

import { browser, $ } from 'protractor';
import { helper } from '../utils/helpers';

class UsersAndGroupsPage {
  cNotifications = $('[data-se="onboard__ung__notifications"]');
  cErrors = $('[data-se="onboard__ung__errors"]');

  bSaveAndLogout = $('onboard__ung__save_n_logout');
  bBack = $('onboard__ung__back');
}
