import {Job} from '../models/job.model';
import {BaseState} from '../models/base-resource-state';
import * as fromJob from '../actions/job.action';

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
  const jobEntities = jobs.reduce((entities: { [id: string]: Job }, entity: Job) => {
    return Object.assign({}, entities, {
      [entity.id]: entity
    });
  }, {});
  return {
    entities: Object.assign({}, state.entities, jobEntities)
  };
}
