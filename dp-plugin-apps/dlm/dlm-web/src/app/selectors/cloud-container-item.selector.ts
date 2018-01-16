/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getCloudContainerItems } from './root.selector';
import { mapToList } from '../utils/store-util';

export const getEntities = createSelector(getCloudContainerItems, state => state.entities);
export const getAllFilesForCloudPath = (containerId, path) => createSelector(getEntities, (entities) =>
  containerId in entities && path in entities[containerId] ? mapToList(entities[containerId][path]) : []);
