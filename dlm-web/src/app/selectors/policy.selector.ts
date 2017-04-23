import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { State } from '../reducers/policy.reducer';
import { mapToList } from '../utils/store-util';

export const getEntities = createSelector(getPolicies, (state) => state.entities);
export const getAllPolicies = createSelector(getEntities, mapToList);
