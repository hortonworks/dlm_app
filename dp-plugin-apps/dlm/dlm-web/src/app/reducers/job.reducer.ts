import {Job} from '../models/job.model';
import {BaseState} from '../models/base-resource-state';
import * as fromJob from '../actions/job.action';
import { toEntities } from 'utils/store-util';

export type State = BaseState<Job>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromJob.ActionTypes.LOAD_JOBS.SUCCESS:
      return loadJobsSuccess(state, action);

    default:
      return state;
  }
}

function loadJobsSuccess(state = initialState, action): State {
  const jobs = action.payload.response.jobs;
  return {
    entities: Object.assign({}, state.entities, toEntities<Job>(jobs))
  };
}
