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

import { Component, OnInit, ViewChild } from '@angular/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
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
    [showFooter]="false"
    [showCancel]="false"
    [showOk]="false"
    (onClose)="hideModalHook()">
    <dlm-modal-dialog-header-block *ngIf="showHeaderButtons">
      <button class="btn btn-default" (click)="downloadLog()">
        <i class="fa fa-download"></i> {{'common.download' | translate}}
      </button>
      <button class="btn btn-default"
        ngxClipboard
        [cbContent]="message"
        (cbOnSuccess)="handleSuccessCopy()">
        <span [tooltip]="'common.copied' | translate" triggers=" ">
          <i class="fa fa-copy"></i> {{'common.copy' | translate}}
        </span>
      </button>
      <button class="btn btn-default" (click)="openContent()">
        <i class="fa fa-external-link"></i> {{'common.open' | translate}}
      </button>
    </dlm-modal-dialog-header-block>
    <dlm-modal-dialog-body>
      <dlm-progress-container [progressState]="overallProgress$ | async">
        <pre *ngIf="!hasError" class="log-message">{{message}}</pre>
        <div *ngIf="hasError" class="alert alert-warning" role="alert">
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
  private tooltipTimeout: any = null;

  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;
  @ViewChild(TooltipDirective) copiedTooltip: TooltipDirective;

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
          .take(1)
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

  public get showHeaderButtons(): boolean {
    return !this.emptyMessage && !this.hasError;
  }

  public get emptyMessage(): boolean {
    return this.message === this.t.instant('common.empty_log');
  }

  public get hasError(): boolean {
    return this.message === null || this.message === undefined;
  }

  public hideModalHook() {
    this.stopPolling();
  }

  public downloadLog(): void {
    const metaInfo = this.logService.logMetaInfo$.getValue();
    this.logService.downloadLog(metaInfo, this.message);
  }

  public handleSuccessCopy(): void {
    this.copiedTooltip.show();
    const hideTooltip = () => this.tooltipTimeout = setTimeout(() => {
        this.copiedTooltip.hide();
      }, 2000);
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    hideTooltip();
  }

  public openContent() {
    window.open().document.write(`<div style="white-space: pre-wrap; word-break: break-all;">${this.message}</div>`);
  }
}
