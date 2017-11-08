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

import {$, $$} from 'protractor';
import {helper} from '../../utils/helpers';

export class ServiceEnablementPage {
  public cAvailableServices = $$('[data-se-group="services__availableServices"]');
  public cEnabledServices = $$('[data-se-group="services__enabledServices"]');
  public cClusterList = $$('[data-se-group="services__enabledServices-clusterList"]');
  public cSuccessNotification = $('[data-se="services__notificatiob-bar"]');

  getActionButton(element) {
    return element.$('[data-se="services__availableServices-enable-button"]');
  }

  async getEnablementPage() {
    await helper.safeGet('/infra/services');
  }

  getEnbledServiceName(element) {
    return element.$('[data-se="services__enabledServices-serviceName"]');
  }

  getShowClustersButton(element){
    return element.$('[data-se="services__enabledServices_showClustersButton"]');
  }

}
