/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Action } from '@ngrx/store';

import { requestType } from 'utils/type-action';
import { YarnQueueResponse } from 'models/yarnqueues.model';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { ActionWithPayload } from 'actions/actions.type';

export const ActionTypes = {
  LOAD_YARN_QUEUES: requestType('LOAD_YARN_QUEUES')
};

export const loadYarnQueues = (clusterId: number, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_YARN_QUEUES.START,
  payload: {meta, clusterId}
});

export const loadYarnQueuesSuccess = ({response, clusterId}, meta): ActionSuccess => ({
  type: ActionTypes.LOAD_YARN_QUEUES.SUCCESS,
  payload: {response, clusterId, meta}
});

export const loadYarnQueuesFailure = (error, meta): ActionFailure => ({
  type: ActionTypes.LOAD_YARN_QUEUES.FAILURE,
  payload: {error, meta}
});

