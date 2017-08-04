/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { FormStore } from 'models/form-store.model';
import * as formAction from 'actions/form.action';

export interface State {
  entities: { [id: string]: FormStore};
};

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case formAction.ActionTypes.SAVE_FORM_VALUE: {
      const { formId, values } = action.payload;
      return {
        entities: {
          ...state.entities,
          [formId]: {values}
        }
      };
    }
    case formAction.ActionTypes.RESET_FORM_VALUE: {
      const { formId } = action.payload;
      const { [formId]: removed, ...rest} = state.entities;
      return {
        entities: {
          ...rest
        }
      };
    }
    default:
      return state;
  }
};
