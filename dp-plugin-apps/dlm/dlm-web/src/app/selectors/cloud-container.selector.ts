/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { mapToList } from 'utils/store-util';
import { getCloudContainers } from './root.selector';
import { groupByKey } from '../utils/array-util';

export const getEntities = (type) => createSelector(getCloudContainers, state => state[type].entities);

export const getEntitiesGroupedByAccount =
  (type) => createSelector(getEntities(type), containers => groupByKey(mapToList(containers), 'accountId'));

export const getAllContainers =
  createSelector(getEntities('WASB'), getEntities('S3'), getEntities('ADSL'), (wasb, s3, adsl) =>
    [...mapToList(wasb), ...mapToList(s3), ...mapToList(adsl)]);

export const getAllContainersGrouped =
  createSelector(getEntities('WASB'), getEntities('S3'), getEntities('ADSL'), (wasb, s3, adsl) => ({
    WASB: mapToList(wasb || {}), S3: mapToList(s3 || {}), ADSL: mapToList(adsl || {})
  }));

export const getContainer = (id) => createSelector(getEntities('WASB'), getEntities('S3'), getEntities('ADSL'), (wasb, s3, adsl) =>
wasb[id] || s3[id] || adsl[id]);

export const getContainersGroupedByAccounts = createSelector(
  getEntitiesGroupedByAccount('WASB'),
  getEntitiesGroupedByAccount('S3'),
  getEntitiesGroupedByAccount('ADSL'),
  (wasb, s3, adsl) => Object.assign({}, wasb, s3, adsl));
