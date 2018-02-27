/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild,
  HostListener
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ModalSize, SIZE_CLASS_MAP } from './modal-dialog.size';

@Component({
  selector: 'dlm-modal-dialog',
  styleUrls: ['./modal-dialog.component.scss'],
  template: `
    <div bsModal #childModal="bs-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" (onHide)="onClose.emit()">
      <div [ngClass]="['modal-dialog', modalSizeClassMap[modalSize]]">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title pull-left">{{ title | translate }}
              <small *ngIf="subtitleLink"><a [href]="subtitleLink" target="_blank">{{subtitleText}}</a></small>
            </h4>
            <div class="pull-right">
              <ng-content select="dlm-modal-dialog-header-block"></ng-content>
              <button type="button" class="close pull-right" data-dismiss="modal" (click)="hide()">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
          <div class="modal-body">
            {{ body | translate}}
            <ng-content select="dlm-modal-dialog-body"></ng-content>
          </div>
          <div class="modal-footer" *ngIf="showFooter">
            <button *ngIf="showCancel" class="btn btn-default" (click)="onClickCancel()" qe-attr="modal-cancel">
              {{ cancelText | translate }}
            </button>
            <button *ngIf="showIgnore" class="btn btn-warning" (click)="onClickIgnore()" qe-attr="modal-ignore">
              {{ ignoreText | translate }}
            </button>
            <button *ngIf="showDelete" class="btn btn-danger" (click)="onClickDelete()" qe-attr="modal-delete">
              {{ deleteText | translate }}
            </button>
            <button *ngIf="showOk" class="btn btn-success" (click)="onClickOk()" qe-attr="modal-confirm">
              {{ okText | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalDialogComponent implements OnInit, OnChanges {
  @ViewChild('childModal') public childModal: ModalDirective;

  size = ModalSize;
  modalSizeClassMap = SIZE_CLASS_MAP;
  // Ok and Cancel buttons are shown by default
  // and can be overridden by respective inputs
  @Input() title: string;
  @Input() subtitleLink: string;
  @Input() subtitleText: string;
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
  @Input() modalSize = this.size.SMALL;
  @Input() showFooter = true;
  @Output() onOk = new EventEmitter<boolean>();
  @Output() onDelete = new EventEmitter<boolean>();
  @Output() onIgnore = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<boolean>();

  @HostListener('keydown', ['$event']) handleKeyboardEvents(event: KeyboardEvent) {
    const code = event.which || event.keyCode;
    if (code === 27) {
      this.hide();
    }
  }

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
