/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';
import { storeLogger } from 'ngrx-store-logger';

import { environment } from '../../environments/environment';


import * as fromCluster from './cluster.reducer';
import * as fromPolicy from './policy.reducer';
import * as fromPairing from './pairing.reducer';
import * as fromJob from './job.reducer';
import * as fromForm from './form.reducer';
import * as fromEvent from './event.reducer';
import * as fromProgress from './progress.reducer';
import * as fromCreatePolicy from './create-policy.reducer';
import * as fromOperation from './operation.reducer';
import * as fromHdfs from './hdfs.reducer';
import * as fromHive from './hive.reducer';
import * as fromLog from './log.reducer';
import * as fromBeaconAdminStatus from './beacon-admin-status.reducer';
import * as fromUnreachableBeacon from './unreachable-beacon.reducer';
import * as fromYarnQueues from './yarn-queues.reducer';
import * as fromCloudAccount from './cloud-account.reducer';
import * as fromCloudContainer from './cloud-container.reducer';
import * as fromCloudContainerItem from './cloud-container-item.reducer';
import * as fromBeaconCloudCred from './beacon-cloud-cred.reducer';
import * as fromBeaconConfigStatus from './beacon-config-status.reducer';
import * as fromAmbari from './ambari.reducer';
import * as fromStaleCluster from './stale-cluster.reducer';
import * as fromSkuService from './sku-service.reducer';
import * as fromGa from './ga.reducer';
import * as fromDlmProperties from './dlm-properties.reducer';

export interface State {
  router: RouterReducerState;
  clusters: fromCluster.State;
  policies: fromPolicy.State;
  pairings: fromPairing.State;
  jobs: fromJob.State;
  forms: fromForm.State;
  events: fromEvent.State;
  progress: fromProgress.State;
  operations: fromOperation.State;
  hdfsFiles: fromHdfs.State;
  hiveDatabases: fromHive.State;
  logs: fromLog.State;
  beaconAdminStatus: fromBeaconAdminStatus.State;
  unreachableBeacon: fromUnreachableBeacon.State;
  yarnQueues: fromYarnQueues.State;
  cloudAccounts: fromCloudAccount.State;
  cloudContainers: fromCloudContainer.State;
  cloudContainerItems: fromCloudContainerItem.State;
  beaconCloudCreds: fromBeaconCloudCred.State;
  createPolicyWizard: fromCreatePolicy.State;
  beaconConfigStatuses: fromBeaconConfigStatus.State;
  ambariInfo: fromAmbari.State;
  staleClusters: fromStaleCluster.State;
  skuServices: fromSkuService.State;
  ga: fromGa.State;
  dlmProperties: fromDlmProperties.State;
}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  clusters: fromCluster.reducer,
  policies: fromPolicy.reducer,
  pairings: fromPairing.reducer,
  jobs: fromJob.reducer,
  forms: fromForm.reducer,
  events: fromEvent.reducer,
  progress: fromProgress.reducer,
  operations: fromOperation.reducer,
  hdfsFiles: fromHdfs.reducer,
  hiveDatabases: fromHive.reducer,
  logs: fromLog.reducer,
  beaconAdminStatus: fromBeaconAdminStatus.reducer,
  unreachableBeacon: fromUnreachableBeacon.reducer,
  yarnQueues: fromYarnQueues.reducer,
  cloudAccounts: fromCloudAccount.reducer,
  cloudContainers: fromCloudContainer.reducer,
  cloudContainerItems: fromCloudContainerItem.reducer,
  beaconCloudCreds: fromBeaconCloudCred.reducer,
  createPolicyWizard: fromCreatePolicy.reducer,
  beaconConfigStatuses: fromBeaconConfigStatus.reducer,
  ambariInfo: fromAmbari.reducer,
  staleClusters: fromStaleCluster.reducer,
  skuServices: fromSkuService.reducer,
  ga: fromGa.reducer,
  dlmProperties: fromDlmProperties.reducer
};

export const logger = (reducer: ActionReducer<State>) => {
  return storeLogger()(reducer);
};

export const metaReducers = environment.production ? [] : [logger];
