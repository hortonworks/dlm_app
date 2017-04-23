import { createSelector } from 'reselect';
import { State } from '../reducers';

export const getClusters = (state: State) => state.clusters;
export const getPolicies = (state: State) => state.policies;
export const getPairings = (state: State) => state.pairings;
