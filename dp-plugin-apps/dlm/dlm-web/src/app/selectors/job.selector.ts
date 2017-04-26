import {createSelector} from 'reselect';
import {getJobs} from './root.selector';
import {mapToList} from '../utils/store-util';

export const getEntities = createSelector(getJobs, state => state.entities);
export const getAllJobs = createSelector(getEntities, mapToList);
