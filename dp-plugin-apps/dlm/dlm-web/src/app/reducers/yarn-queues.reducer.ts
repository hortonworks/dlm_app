/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { BaseState } from 'models/base-resource-state';
import { YarnQueue, YarnQueueResponse } from 'models/yarnqueues.model';
import { ActionTypes } from 'actions/yarnqueues.action';

export type State = BaseState<YarnQueue[]>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case ActionTypes.LOAD_YARN_QUEUES.SUCCESS: {
      const { clusterId, response }: {clusterId: number, response: YarnQueueResponse} = action.payload;
      return {
        entities: {
          ...state.entities,
          [clusterId]: response.items
        }
      };
    }
    default: {
      return state;
    }
  }
}
