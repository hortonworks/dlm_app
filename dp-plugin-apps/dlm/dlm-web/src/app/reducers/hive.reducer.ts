/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
