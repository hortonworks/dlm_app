import {ListStatus} from 'models/list-status.model';
import {BaseState} from 'models/base-resource-state';
import * as fromHdfs from 'actions/hdfslist.action';

export type State = BaseState<{[clusterId: number]: ListStatus}>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromHdfs.ActionTypes.LIST_FILES.SUCCESS:
      return listFilesSuccess(state, action);

    default:
      return state;
  }
}

function listFilesSuccess(state = initialState, action): State {
  const fileStatus = action.payload.response.FileStatuses.FileStatus;
  const fileStatusEntities = fileStatus.reduce((entities: { [path: string]: ListStatus }, entity: ListStatus) => {
    return Object.assign({}, entities, {
      [entity.pathSuffix]: entity
    });
  }, {});
  const key: any = <any>action.payload.meta.clusterId;
  if (key && !(key in state.entities)) {
    state.entities[action.payload.meta.clusterId] = {};
  }
  return {
    entities: Object.assign({}, state.entities, { [action.payload.meta.clusterId]: Object.assign(
      {},
      state.entities[action.payload.meta.clusterId],
      { [action.payload.meta.path]: fileStatusEntities }
    )
    })
  };
}
