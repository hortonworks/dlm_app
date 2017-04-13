import { createSelector } from 'reselect';
import { getPolicies } from './root';
import { State } from '../reducers/policy';
import { mapToList } from '../utils/store-util';

export const getEntities = createSelector(getPolicies, (state) => state.entities);
export const getAllPolicies = createSelector(getEntities, mapToList);
