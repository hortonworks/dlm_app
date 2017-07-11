import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { NOTIFICATION_LOG_NOT_LOADED } from '../../constants/notification.constant';

@Component({
  selector: 'dlm-log-modal-dialog',
  styleUrls: ['./log-modal-dialog.component.scss'],
  template: `<dlm-modal-dialog #logModalDialog
    [title]=" 'page.notifications.table.column.log' "
    [modalSize]="modalSize"
    [showCancel]="false"
    (onClose)="closeModal()">
    <dlm-modal-dialog-body>
      <div *ngIf="message === NOTIFICATION_LOG_NOT_LOADED; else messageIsLoaded">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <ng-template #messageIsLoaded>
        <pre *ngIf="message" class="log-message">
          {{message}}
        </pre>
        <div *ngIf="!message" class="alert alert-warning" role="alert">
          {{ "common.errors.no_log" | translate }}
        </div>
      </ng-template>
    </dlm-modal-dialog-body>
  </dlm-modal-dialog>
  `
})
export class LogModalDialogComponent implements OnInit {
  NOTIFICATION_LOG_NOT_LOADED = NOTIFICATION_LOG_NOT_LOADED;
  modalSize = ModalSize.LARGE;
  @Input() message: string;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;

  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    this.onClose.emit();
  }

  public show(): void {
    this.logModalDialog.show();
  }
}
