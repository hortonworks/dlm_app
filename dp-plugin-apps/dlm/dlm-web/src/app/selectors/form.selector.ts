/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getForms } from './root.selector';

export const getForm = (formId: string) => createSelector(getForms, (state) => state.entities[formId]);
export const getFormValues = (formId: string) => createSelector(getForm(formId), (form) => {
  if (form && 'values' in form) {
    return form.values;
  }
  return  {};
});
