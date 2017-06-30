import { createSelector } from 'reselect';
import { getLogs } from './root.selector';
import { mapToList } from '../utils/store-util';

export const getAllLogs = createSelector(getLogs, state => mapToList(state.entities));
