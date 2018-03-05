/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ActionWithPayload } from 'actions/actions.type';
import { confirmationOptionsDefaults, ConfirmationOptions } from 'components/confirmation-modal/confirmation-options.type';

export interface ConfirmationModalState {
  isVisible: boolean;
  nextAction: ActionWithPayload<any>;
  confirmationOptions: ConfirmationOptions;
}
@Injectable()
export class ConfirmationService {

  state$ = new BehaviorSubject<ConfirmationModalState>({
    isVisible: false,
    nextAction: null,
    confirmationOptions: confirmationOptionsDefaults
  });

  private updateState(newState) {
    const old = this.state$.getValue();
    this.state$.next({
      ...old,
      ...newState
    });
  }

  constructor() { }

  showConfirmation() {
    this.updateState({ isVisible: true });
  }

  hideConfirmation() {
    this.updateState({ isVisible: false });
  }

  initActionConfirmation(action: ActionWithPayload<any>, confirmationOptions: ConfirmationOptions) {
    this.showConfirmation();
    this.updateState({ nextAction: action, confirmationOptions });
  }
}
