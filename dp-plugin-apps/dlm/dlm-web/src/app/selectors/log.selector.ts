/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getLogs } from './root.selector';
import { mapToList } from '../utils/store-util';
import { Log } from 'models/log.model';

export const getAllLogs = createSelector(getLogs, state => mapToList(state.entities) as Log[]);
export const getLogByInstanceId = (instanceId: string) =>
  createSelector(getAllLogs, (logs: Log[]) => logs.find(log => log.instanceId === instanceId) as Log);
