import { isDevMode } from '@angular/core';
import { ActionReducer } from '@ngrx/store';
import { combineReducers } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { storeLogger } from 'ngrx-store-logger';

import { compose } from '@ngrx/core/compose';

import * as fromCluster from './cluster';

export interface State {
  clusters: fromCluster.State;
};

const reducers = {
  clusters: fromCluster.reducer
};

const devReducer: ActionReducer<State> = compose(storeLogger(), combineReducers)(reducers);
const prodReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return prodReducer(state, action);
  }
  return devReducer(state, action);
};
