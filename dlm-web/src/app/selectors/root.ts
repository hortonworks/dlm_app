import { createSelector } from 'reselect';
import { State } from '../reducers';

export const getClusters = (state: State) => state.clusters;
