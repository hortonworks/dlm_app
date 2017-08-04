/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Action } from '@ngrx/store';
import { type } from 'utils/type-action';

export const ActionTypes = {
  INIT_APP: type('INIT_APP'),
  NOOP: type('NOOP')
};

export const initApp = (): Action => ({ type: ActionTypes.INIT_APP });
export const noop = (): Action => ({ type: ActionTypes.NOOP });
