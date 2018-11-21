/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Pairing } from '../models/pairing.model';
import * as fromPairing from '../actions/pairing.action';
import {PROGRESS_STATUS} from 'constants/status.constant';
import {Progress} from 'models/progress.model';
import { Response } from '@angular/http';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface State extends EntityState<Pairing> {
  progress: Progress;
}

export const pairingAdapter: EntityAdapter<Pairing> = createEntityAdapter<Pairing>({
  selectId: pairing => `${pairing.cluster1.id}-${pairing.cluster2.id}`
});

export const initialState: State = pairingAdapter.getInitialState({
  entities: {},
  progress: <Progress>{
    state: PROGRESS_STATUS.INIT,
    response: <Response>{}
  }
});

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromPairing.ActionTypes.LOAD_PAIRINGS.SUCCESS: {
      const pairings = action.payload.response.pairedClusters;
      return {
        ...pairingAdapter.addMany(pairings, state),
        progress: { ...initialState.progress }
      };
    }
    case fromPairing.ActionTypes.CREATE_PAIRING.SUCCESS: {
      return {
        ...state,
        entities: { ...state.entities },
        progress: {
          ...state.progress,
          state: PROGRESS_STATUS.SUCCESS,
          response: <Response>{}
        }
      };
    }
    case fromPairing.ActionTypes.DELETE_PAIRING.SUCCESS: {
      const pairing = action.payload.response.payload;
      const key = pairing[0].clusterId + '-' + pairing[1].clusterId;
      return {
        ...pairingAdapter.removeOne(key, state),
        progress: { ...state.progress }
      };
    }
    case fromPairing.ActionTypes.CREATE_PAIRING.FAILURE: {
      const error = action.payload.error;
      return {
        ...state,
        entities: { ...state.entities },
        progress: {
          ...state.progress,
          state: PROGRESS_STATUS.FAILED,
          response: error
        }
      };
    }
    case fromPairing.ActionTypes.LOAD_PAIRINGS.FAILURE:
    case fromPairing.ActionTypes.DELETE_PAIRING.FAILURE:
    default: {
      return state;
    }
  }
}
