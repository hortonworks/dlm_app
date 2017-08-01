import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { LogService, LOG_REQUEST } from 'services/log.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Subscription } from 'rxjs/Subscription';
import { getMergedProgress } from 'selectors/progress.selector';
import { Observable } from 'rxjs/Observable';
import { ProgressState } from 'models/progress-state.model';

@Component({
  selector: 'dlm-log-modal-dialog',
  styleUrls: ['./log-modal-dialog.component.scss'],
  template: `
  <dlm-modal-dialog #logModalDialog
    [title]=" 'page.notifications.table.column.log' "
    [modalSize]="modalSize"
    [showCancel]="false">
    <dlm-modal-dialog-body>
      <dlm-progress-container [progressState]="overallProgress$ | async">
        <pre *ngIf="message" class="log-message">
          {{message}}
        </pre>
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
  private listener: Subscription;
  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;

  constructor(private logService: LogService, private store: Store<fromRoot.State>) {
    this.overallProgress$ = store.select(getMergedProgress(LOG_REQUEST));
  }

  ngOnInit(): void {
    // Listen for changes in the service
    this.listener = this.logService.getChangeEmitter()
      .subscribe(item => {
        this.message = item;
        this.logModalDialog.show();
      });
  }

  public show(): void {
    this.logModalDialog.show();
  }
}
