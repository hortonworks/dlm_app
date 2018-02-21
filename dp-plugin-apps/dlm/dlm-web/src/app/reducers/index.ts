/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';
import { storeLogger } from 'ngrx-store-logger';

import { environment } from '../../environments/environment';

import { compose } from '@ngrx/store';

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
  createPolicyWizard: fromCreatePolicy.State;
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
  createPolicyWizard: fromCreatePolicy.reducer
};

export const logger = (reducer: ActionReducer<State>) => {
  return storeLogger()(reducer);
};

export const metaReducers = environment.production ? [] : [logger];
