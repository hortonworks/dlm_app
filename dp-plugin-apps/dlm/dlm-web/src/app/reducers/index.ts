/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionReducer } from '@ngrx/store';
import { combineReducers } from '@ngrx/store';
import { routerReducer, RouterState } from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { storeLogger } from 'ngrx-store-logger';

import { compose } from '@ngrx/core/compose';

import * as fromCluster from './cluster.reducer';
import * as fromPolicy from './policy.reducer';
import * as fromPairing from './pairing.reducer';
import * as fromJob from './job.reducer';
import * as fromForm from './form.reducer';
import * as fromEvent from './event.reducer';
import * as fromProgress from './progress.reducer';
import * as fromOperation from './operation.reducer';
import * as fromHdfs from './hdfs.reducer';
import * as fromHive from './hive.reducer';
import * as fromLog from './log.reducer';
import * as fromBeaconAdminStatus from './beacon-admin-status.reducer';

export interface State {
  router: RouterState;
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
}

const reducers = {
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
  beaconAdminStatus: fromBeaconAdminStatus.reducer
};

const devReducer: ActionReducer<State> = compose(storeLogger(), combineReducers)(reducers);
const prodReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return prodReducer(state, action);
  }
  return devReducer(state, action);
}
