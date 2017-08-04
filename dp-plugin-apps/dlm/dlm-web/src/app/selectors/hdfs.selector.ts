/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {createSelector} from 'reselect';
import {getFilesList} from './root.selector';
import {mapToList} from '../utils/store-util';

export const getEntities = createSelector(getFilesList, state => state.entities);
export const getAllFilesForClusterPath = (clusterId, path) => createSelector(getEntities,
  (entities) => {
    return clusterId in entities && path in entities[clusterId] ? mapToList(entities[clusterId][path]) : [];
  });
