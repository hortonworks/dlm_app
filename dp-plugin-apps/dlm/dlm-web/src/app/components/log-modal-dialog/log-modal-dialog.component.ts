import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';

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
  @Input() message: string;
  @ViewChild('logModalDialog') logModalDialog: ModalDialogComponent;

  constructor() { }

  ngOnInit() {
  }

  public show(): void {
    this.logModalDialog.show();
  }
}
