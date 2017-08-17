/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import * as fromRoot from 'reducers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'services/confirmation.service';

@Component({
  selector: 'dlm-confirmation-modal-container',
  template: `
  <dlm-modal-dialog
    qe-attr="confirmation-modal"
    [title]="'page.policies.perform_action.confirmation.title'"
    [body]="'page.policies.perform_action.confirmation.body'"
    [showDialog]="(modalState$ | async)?.isVisible"
    (onOk)="handleConfirm()">
  </dlm-modal-dialog>
  `
})
export class ConfirmationModalContainerComponent implements OnInit {

  modalState$: BehaviorSubject<any>;

  constructor(private store: Store<fromRoot.State>, private confirmation: ConfirmationService) {
    this.modalState$ = confirmation.state$;
  }

  ngOnInit() {
  }

  handleConfirm() {
    const modalState = this.confirmation.state$.getValue();
    if (modalState.nextAction) {
      this.store.dispatch(modalState.nextAction);
    }
  }
}
