import { Action } from '@ngrx/store';

import { type } from 'utils/type-action';

export const ActionTypes = {
  SAVE_FORM_VALUE: type('SAVE_FORM_VALUE'),
  RESET_FORM_VALUE: type('RESET_FORM_VALUE')
};

export const saveFormValue = (formId: string, values: Object): Action => {
  return { type: ActionTypes.SAVE_FORM_VALUE, payload: { formId, values } };
};

export const resetFormValue = (formId: string): Action => {
  return { type: ActionTypes.RESET_FORM_VALUE, payload: { formId }};
};
