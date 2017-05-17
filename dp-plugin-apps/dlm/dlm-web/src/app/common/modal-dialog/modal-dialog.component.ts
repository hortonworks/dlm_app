import { Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'dlm-modal-dialog',
  styleUrls: ['./modal-dialog.component.scss'],
  template: `
    <div bsModal #childModal="bs-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title pull-left">{{ title | translate }}</h4>
            <button type="button" class="close pull-right" data-dismiss="modal" (click)="hide()">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            {{ body | translate}}
            <ng-content select="dlm-modal-dialog-body"></ng-content>
          </div>
          <div class="modal-footer">
            <button *ngIf="showCancel" class="btn btn-default" (click)="onClickCancel()">{{ cancelText | translate }}</button>
            <button *ngIf="showIgnore" class="btn btn-warning" (click)="onClickIgnore()">{{ ignoreText | translate }}</button>
            <button *ngIf="showDelete" class="btn btn-danger" (click)="onClickDelete()">{{ deleteText | translate }}</button>
            <button *ngIf="showOk" class="btn btn-success" (click)="onClickOk()">{{ okText | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalDialogComponent implements OnInit, OnChanges {
  @ViewChild('childModal') public childModal: ModalDirective;

  // Ok and Cancel buttons are shown by default
  // and can be overridden by respective inputs
  @Input() title: string;
  @Input() body: string;
  @Input() okText = 'OK';
  @Input() deleteText = 'Delete';
  @Input() ignoreText = 'Ignore';
  @Input() cancelText = 'Cancel';
  @Input() showOk = true;
  @Input() showCancel = true;
  @Input() showIgnore = false;
  @Input() showDelete = false;
  @Input() showDialog = false;
  @Output() onOk = new EventEmitter<boolean>();
  @Output() onDelete = new EventEmitter<boolean>();
  @Output() onIgnore = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['showDialog']) {
      if (this.showDialog === true) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  public show(): void {
    this.childModal.show();
  }

  public hide(): void {
    this.childModal.hide();
  }

  onClickCancel() {
    this.hide();
    this.onCancel.emit(true);
  }

  onClickOk() {
    this.hide();
    this.onOk.emit(true);
  }

  onClickDelete() {
    this.hide();
    this.onDelete.emit(true);
  }

  onClickIgnore() {
    this.hide();
    this.onIgnore.emit(true);
  }
}
