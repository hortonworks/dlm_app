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
    default:
      return state;
  }
};
