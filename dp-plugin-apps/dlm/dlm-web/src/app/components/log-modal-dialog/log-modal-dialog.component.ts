/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { LogService, LOG_REQUEST } from 'services/log.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Subscription } from 'rxjs/Subscription';
import { getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { Observable } from 'rxjs/Observable';
import { ProgressState } from 'models/progress-state.model';
import { TranslateService } from '@ngx-translate/core';
import { loadLogs } from 'actions/log.action';
import { POLL_INTERVAL } from 'constants/api.constant';

const INTERNAL_LOG_REQUEST = '[LogModalDialogComponent] LOGS_REQUEST';

@Component({
  selector: 'dlm-log-modal-dialog',
  styleUrls: ['./log-modal-dialog.component.scss'],
  template: `
  <dlm-modal-dialog #logModalDialog
    [title]=" 'page.notifications.table.column.log' "
    [modalSize]="modalSize"
    [showCancel]="false"
    (onClose)="hideModalHook()">
    <dlm-modal-dialog-body>
      <dlm-progress-container [progressState]="overallProgress$ | async">
        <pre *ngIf="message" class="log-message">{{message}}</pre>
        <div *ngIf="!message" class="alert alert-warning" role="alert">
          {{ "common.errors.no_log" | translate }}
        </div>
      </dlm-progress-container>
    </dlm-modal-dialog-body>
  </dlm-modal-dialog>
  `
})
export class LogModalDialogComponent implements OnInit {
  modalSize = ModalSize.LARGE;
  message: string;
  overallProgress$: Observable<ProgressState>;
  private polling: Subscription;
  private listener: Subscription;
  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;

  private startPolling(): void {
    if (this.polling) {
      return;
    }
    const metaInfo = this.logService.logMetaInfo$.getValue();
    this.polling = Observable.timer(POLL_INTERVAL)
      .switchMap(() => {
        this.store.dispatch(loadLogs(
          metaInfo.clusterId,
          metaInfo.entityId,
          metaInfo.entityType,
          INTERNAL_LOG_REQUEST,
          metaInfo.timestamp
        ));
        return this.store.select(getProgressState(INTERNAL_LOG_REQUEST))
          .distinctUntilKeyChanged('isInProgress')
          .filter(p => !p.isInProgress)
          .first()
          .delay(POLL_INTERVAL);
      })
      .repeat()
      .subscribe();
  }

  private stopPolling(): void {
    if (!this.polling) {
      return;
    }
    this.polling.unsubscribe();
    this.polling = null;
  }

  constructor(private logService: LogService, private store: Store<fromRoot.State>, private t: TranslateService) {
    this.overallProgress$ = store.select(getMergedProgress(LOG_REQUEST));
  }

  ngOnInit(): void {
    // Listen for changes in the service
    this.listener = this.logService.getChangeEmitter()
      .subscribe(item => {
        this.message = item === '' ? this.t.instant('common.empty_log') : item;
        this.logModalDialog.show();
        this.startPolling();
      });
  }

  public show(): void {
    this.logModalDialog.show();
  }

  public hideModalHook() {
    this.stopPolling();
  }
}
