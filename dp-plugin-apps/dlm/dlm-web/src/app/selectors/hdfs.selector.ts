import {createSelector} from 'reselect';
import {getFilesList} from './root.selector';
import {mapToList} from '../utils/store-util';

export const getEntities = createSelector(getFilesList, state => state.entities);
export const getAllFilesForClusterPath = (clusterId, path) => createSelector(getEntities,
  (entities) => {
    return clusterId in entities && path in entities[clusterId] ? mapToList(entities[clusterId][path]) : [];
  });
