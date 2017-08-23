/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Pairing } from '../models/pairing.model';
import * as fromPairing from '../actions/pairing.action';
import { Cluster } from 'models/cluster.model';
import {BaseState} from 'models/base-resource-state';
import {PROGRESS_STATUS} from 'constants/status.constant';
import {Progress} from 'models/progress.model';
import { Response } from '@angular/http';

export interface State extends BaseState<Pairing> {
  progress: Progress;
}

export const initialState: State = {
  entities: {},
  progress: <Progress>{
    state: PROGRESS_STATUS.INIT,
    response: <Response>{}
  }
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPairing.ActionTypes.LOAD_PAIRINGS.SUCCESS: {
      const pairings = action.payload.response.pairedClusters;
      const pairingEntities = pairings.reduce((entities: {[id: string]: Pairing}, entity: [Cluster, Cluster]) => {
        const id = entity[0]['id'] + '-' + entity[1]['id'];
        return Object.assign({}, entities, {
          [id]: {
            'id': id,
            'pair': entity
          }
        });
      }, {});
      return {
        entities: Object.assign({}, state.entities, pairingEntities),
        progress: Object.assign({}, initialState.progress)
      };
    }
    case fromPairing.ActionTypes.CREATE_PAIRING.SUCCESS: {
      return {
        entities: Object.assign({}, state.entities),
        progress: Object.assign({}, state.progress, {
          state: PROGRESS_STATUS.SUCCESS,
          response: {}
        })
      };
    }
    case fromPairing.ActionTypes.DELETE_PAIRING.SUCCESS: {
      const entities = Object.assign({}, state.entities);
      const pairing = action.payload.response.payload;
      const key = pairing[0].clusterId + '-' + pairing[1].clusterId;
      delete entities[key];
      return {
        entities: Object.assign({}, entities),
        progress: Object.assign({}, state.progress)
      };
    }
    case fromPairing.ActionTypes.CREATE_PAIRING.FAILURE: {
      const error = action.payload.error;
      return {
        entities: Object.assign({}, state.entities),
        progress: Object.assign({}, state.progress, {
          state: PROGRESS_STATUS.FAILED,
          response: error
        })
      };
    }
    case fromPairing.ActionTypes.LOAD_PAIRINGS.FAILURE:
    case fromPairing.ActionTypes.DELETE_PAIRING.FAILURE:
    default: {
      return state;
    }
  }
}
