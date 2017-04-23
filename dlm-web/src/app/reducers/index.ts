import { ActionReducer } from '@ngrx/store';
import { combineReducers } from '@ngrx/store';
import { routerReducer, RouterState } from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { storeLogger } from 'ngrx-store-logger';

import { compose } from '@ngrx/core/compose';

import * as fromCluster from './cluster.reducer';
import * as fromPolicy from './policy.reducer';
import * as fromPairing from './pairing.reducer';

export interface State {
  clusters: fromCluster.State;
  policies: fromPolicy.State;
  pairings: fromPairing.State;
  router: RouterState;
}

const reducers = {
  clusters: fromCluster.reducer,
  policies: fromPolicy.reducer,
  pairings: fromPairing.reducer,
  router: routerReducer
};

const devReducer: ActionReducer<State> = compose(storeLogger(), combineReducers)(reducers);
const prodReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return prodReducer(state, action);
  }
  return devReducer(state, action);
}
