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
