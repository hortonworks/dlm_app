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

export interface State {
  router: RouterState;
  clusters: fromCluster.State;
  policies: fromPolicy.State;
  pairings: fromPairing.State;
  jobs: fromJob.State;
  forms: fromForm.State;
}

const reducers = {
  router: routerReducer,
  clusters: fromCluster.reducer,
  policies: fromPolicy.reducer,
  pairings: fromPairing.reducer,
  jobs: fromJob.reducer,
  forms: fromForm.reducer
};

const devReducer: ActionReducer<State> = compose(storeLogger(), combineReducers)(reducers);
const prodReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return prodReducer(state, action);
  }
  return devReducer(state, action);
}
