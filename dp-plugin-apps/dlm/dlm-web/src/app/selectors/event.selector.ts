import { createSelector } from 'reselect';
import { getEvents } from './root.selector';
import { mapToList } from '../utils/store-util';
import { EVENT_SEVERITY } from 'constants/status.constant';
import { sortByDateField } from 'utils/array-util';

const skipSucceed = events => events.filter(event => event.severity !== EVENT_SEVERITY.INFO);
export const getEntities = createSelector(getEvents, state => state.entities);
export const getAllEvents = createSelector(getEntities, mapToList);
export const getNewEventsCount = createSelector(getEvents, state => state.newEventsCount);
export const getDisplayedEvents = createSelector(getAllEvents, skipSucceed);
export const getAllDisplayedEvents = createSelector(getEntities, events => sortByDateField(events, 'timestamp'));
