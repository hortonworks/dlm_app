/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
    [attr.qe-attr]="(modalState$ | async)?.confirmationOptions.qeAttr || 'confirmation-modal'"
    [showDialog]="(modalState$ | async)?.isVisible"
    [title]="(modalState$ | async)?.confirmationOptions.title"
    [body]="(modalState$ | async)?.confirmationOptions.body"
    [okText]="(modalState$ | async)?.confirmationOptions.confirmBtnText"
    [cancelText]="(modalState$ | async)?.confirmationOptions.cancelBtnText"
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
    modalState.confirmationOptions.callback();
  }
}
