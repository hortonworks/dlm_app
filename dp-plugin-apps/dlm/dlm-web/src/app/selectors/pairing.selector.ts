import { createSelector } from 'reselect';
import { State } from '../reducers/pairing.reducer';
import { getPairings } from './root.selector';

import { mapToList } from '../utils/store-util';

export const getEntities = createSelector(getPairings, (state) => state.entities);
export const getAllPairings = createSelector(getEntities, mapToList);
