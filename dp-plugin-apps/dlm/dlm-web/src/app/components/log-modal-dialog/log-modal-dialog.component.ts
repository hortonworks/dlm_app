import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { LogService } from 'services/log.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'dlm-log-modal-dialog',
  styleUrls: ['./log-modal-dialog.component.scss'],
  template: `<dlm-modal-dialog #logModalDialog
    [title]=" 'page.notifications.table.column.log' "
    [modalSize]="modalSize"
    [showCancel]="false">
    <dlm-modal-dialog-body>
      <pre *ngIf="message" class="log-message">
        {{message}}
      </pre>
      <div *ngIf="!message" class="alert alert-warning" role="alert">
        {{ "common.errors.no_log" | translate }}
      </div>
    </dlm-modal-dialog-body>
  </dlm-modal-dialog>
  `
})
export class LogModalDialogComponent implements OnInit {
  modalSize = ModalSize.LARGE;
  message: string;
  private listener: Subscription;
  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;

  constructor(private logService: LogService) { }

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
