import { ActionReducer } from '@ngrx/store';
import { combineReducers } from '@ngrx/store';
import { routerReducer, RouterState } from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { storeLogger } from 'ngrx-store-logger';

import { compose } from '@ngrx/core/compose';

import * as fromCluster from './cluster';
import * as fromPolicy from './policy';

export interface State {
  clusters: fromCluster.State;
  policies: fromPolicy.State;
  router: RouterState;
};

const reducers = {
  clusters: fromCluster.reducer,
  policies: fromPolicy.reducer,
  router: routerReducer
};

const devReducer: ActionReducer<State> = compose(storeLogger(), combineReducers)(reducers);
const prodReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return prodReducer(state, action);
  }
  return devReducer(state, action);
};
