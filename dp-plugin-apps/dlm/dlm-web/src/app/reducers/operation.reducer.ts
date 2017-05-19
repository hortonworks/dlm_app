import * as operationAction from 'actions/operation.action';
import { OperationResponse } from 'models/operation-response.model';

export interface State {
  entities: { [id: string]: OperationResponse };
  lastResponse: OperationResponse;
}

export const initialState: State = {
  entities: {},
  lastResponse: null
};

export function reducer(state = initialState, action): State {

  switch (action.type) {
    case operationAction.ActionTypes.OPERATION_COMPLETE:
    case operationAction.ActionTypes.OPERATION_FAIL:
      return operationFinished(state, action);

    default:
      return state;
  }
}

function operationFinished(state: State, action): State {
  const newOperationResponse = action.payload;
  const id = String(new Date().getTime());
  const newEntity = {id, ...newOperationResponse};
  const entities = Object.assign({}, state.entities, {[id]: newEntity});
  return Object.assign({}, state, {entities, lastResponse: newEntity});
}
