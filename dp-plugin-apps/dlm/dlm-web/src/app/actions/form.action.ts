/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';

import { type } from 'utils/type-action';

export const ActionTypes = {
  SAVE_FORM_VALUE: type('SAVE_FORM_VALUE'),
  RESET_FORM_VALUE: type('RESET_FORM_VALUE')
};

export const saveFormValue = (formId: string, values: Object): ActionWithPayload<any> => {
  return { type: ActionTypes.SAVE_FORM_VALUE, payload: { formId, values } };
};

export const resetFormValue = (formId: string): ActionWithPayload<any> => {
  return { type: ActionTypes.RESET_FORM_VALUE, payload: { formId }};
};
