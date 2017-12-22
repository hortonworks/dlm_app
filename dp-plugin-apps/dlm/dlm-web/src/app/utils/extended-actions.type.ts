/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';

export interface SuccessPayload {
    response: any;
    meta?: any;
    [propName: string]: any;
}

export interface ErrorPayload {
    error: any;
    meta?: any;
}

export interface ActionSuccess extends ActionWithPayload<SuccessPayload> { }

export interface ActionFailure extends ActionWithPayload<ErrorPayload> { }
