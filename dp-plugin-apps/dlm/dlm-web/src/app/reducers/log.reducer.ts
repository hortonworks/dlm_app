import {Log} from 'models/log.model';
import {BaseState} from 'models/base-resource-state';
import * as fromLog from 'actions/log.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<Log>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromLog.ActionTypes.LOAD_LOGS.SUCCESS:
      return loadLogSuccess(state, action);

    default:
      return state;
  }
}

function loadLogSuccess(state = initialState, action): State {
  const log = action.payload.response;
  const instanceId = action.payload.meta.instanceId;
  const logEntity = {
    [instanceId]: {
      ...log,
      instanceId
    }
  };
  return {
    entities: Object.assign({}, state.entities, logEntity)
  };
}
