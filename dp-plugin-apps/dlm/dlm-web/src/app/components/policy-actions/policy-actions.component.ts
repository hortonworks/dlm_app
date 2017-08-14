/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'dlm-policy-actions',
  templateUrl: './policy-actions.component.html',
  styleUrls: ['./policy-actions.component.scss']
})
export class PolicyActionsComponent {
  @Input() rowId;
  @Input() policyActions;
  @Input() policy;
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

  private actionDisabled(policy, action) {
    if (action.disableFn && typeof action.disableFn === 'function') {
      return action.disableFn(policy, action);
    }
    return action.disabledFor === policy.status || action.enabledFor && policy.status !== action.enabledFor;
  }

  handleSelectedAction(policy, action) {
    this.toggleDropDown();
    if (!this.actionDisabled(policy, action)) {
      this.handler.emit({row: policy, action});
    }
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
  }
}
