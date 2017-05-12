import { createSelector } from 'reselect';
import { getEvents } from './root.selector';
import { mapToList } from '../utils/store-util';

export const getEntities = createSelector(getEvents, (state) => state.entities);
export const getAllEvents = createSelector(getEntities, mapToList);
export const getNewEventsCount = createSelector(getEvents, (state) => state.newEventsCount);
