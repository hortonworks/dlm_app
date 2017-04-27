import { createSelector } from 'reselect';
import { getForms } from './root.selector';

export const getForm = (formId: string) => createSelector(getForms, (state) => state.entities[formId]);
export const getFormValues = (formId: string) => createSelector(getForm(formId), (form) => form.values);