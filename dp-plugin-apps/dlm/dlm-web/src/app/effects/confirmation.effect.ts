/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { ConfirmationService } from 'services/confirmation.service';
import { ActionTypes } from 'actions/confirmation.action';
import { noop } from 'actions/app.action';

@Injectable()
export class ConfirmationEffects {

  @Effect()
  confirmBeforeAction = this.actions$
    .ofType(ActionTypes.CONFIRM_NEXT_ACTION)
    .map(toPayload)
    .mergeMap(payload => {
      this.confirmation.initActionConfirmation(payload.nextAction, payload.confirmationOptions);
      return Observable.of(noop());
    });

  constructor(private actions$: Actions, private confirmation: ConfirmationService) { }
}
