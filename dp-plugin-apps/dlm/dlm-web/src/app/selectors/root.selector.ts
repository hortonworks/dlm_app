import { State } from '../reducers';

export const getClusters = (state: State) => state.clusters;
export const getPolicies = (state: State) => state.policies;
export const getPairings = (state: State) => state.pairings;
export const getJobs = (state: State) => state.jobs;
export const getForms = (state: State) => state.forms;
export const getEvents = (state: State) => state.events;
export const getProgresses = (state: State) => state.progress;
