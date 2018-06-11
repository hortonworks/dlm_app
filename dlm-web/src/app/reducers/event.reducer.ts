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

import { Event } from '../models/event.model';
import { BaseState } from '../models/base-resource-state-array';
import * as fromEvent from '../actions/event.action';

export interface State extends BaseState<Event> {
  newEventsCount: number;
  headId: number;
  tailId: number;
}

export const initialState: State = {
  entities: [],
  newEventsCount: 0,
  headId: 0,
  tailId: 0
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromEvent.ActionTypes.LOAD_EVENTS.SUCCESS:
      return loadEventsSuccess(state, action);
    case fromEvent.ActionTypes.LOAD_NEW_EVENTS_COUNT.SUCCESS:
      return loadNewEventsCountSuccess(state, action);
    case fromEvent.ActionTypes.LOAD_EVENTS.FAILURE:
    case fromEvent.ActionTypes.LOAD_NEW_EVENTS_COUNT.FAILURE:
    default:
      return state;
  }
}

function loadEventsSuccess(state = initialState, action): State {
  const events = action.payload.response.events;
  if (!events.length) {
    return state;
  }
  if (state.headId === 0 && state.tailId === 0) {
    return {
      ...state,
      entities: events,
      headId: events[0].id,
      tailId: events[events.length - 1].id
    };
  }
  const { head, tail } = <{head: Event[], tail: Event[]}>events.reduce((all, event) => {
    if (event.id < state.tailId) {
      return {
        ...all,
        tail: all.tail.concat(event)
      };
    } else if (event.id > state.headId) {
      return {
        ...all,
        head: all.head.concat(event)
      };
    }
    return all;
  }, {head: [], tail: []});
  return {
    ...state,
    entities: [
      ...head,
      ...state.entities,
      ...tail
    ],
    headId: head.length && head[0].id || state.headId,
    tailId: tail.length && tail[tail.length - 1].id || state.tailId
  };
}

function loadNewEventsCountSuccess(state = initialState, action): State {
  const count = action.payload.response.totalCount;
  return {
    ...state,
    entities: state.entities,
    newEventsCount: count
  };
}
