/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { CloudAccountAction, CloudAccountUI } from 'models/cloud-account.model';

export const ACTION_TYPES = {
  DELETE: 'DELETE',
  EDIT: 'EDIT'
};

@Component({
  selector: 'dlm-cloud-account-actions',
  templateUrl: './cloud-account-actions.component.html',
  styleUrls: ['./cloud-account-actions.component.scss']
})
export class CloudAccountActionsComponent {
  @Input() rowId;
  @Input() cloudAccountActions: CloudAccountAction[];
  @Input() cloudAccount;
  @Input() isOpen = false;
  @Output() handler: EventEmitter<any> = new EventEmitter();
  @Output() openChange: EventEmitter<any> = new EventEmitter();

  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
    }
  }

  constructor(private elementRef: ElementRef) { }

  handleSelectedAction(cloudAccount, action) {
    if (this.isDisabled(action)) {
      return;
    }
    this.toggleDropDown();
    this.handler.emit({cloudAccount, action});
  }

  isDisabled(action: CloudAccountAction): boolean {
    return action.disabled && action.disabled(this.cloudAccount);
  }

  tooltipMessage(action: CloudAccountAction): string {
    return this.isDisabled(action) ? action.disabledMessage : '';
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
  }
}
