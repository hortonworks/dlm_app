import { Action } from '@ngrx/store';

export interface ActionSuccess extends Action {
  payload: {
    response: any;
    meta?: any;
  };
};

export interface ActionFailure extends Action {
  payload: {
    error: any;
    meta?: any;
  };
};
