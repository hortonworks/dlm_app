import { BaseState } from 'models/base-resource-state';
import { HiveDatabase } from 'models/hive-database.model';
import { ActionTypes } from 'actions/hivelist.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<HiveDatabase>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case ActionTypes.LOAD_DATABASES.SUCCESS:
      const databases = action.payload.response;
      return {
        entities: Object.assign({}, state.entities, toEntities<HiveDatabase>(databases, 'entityId'))
      };
    default:
      return state;
  }
};
