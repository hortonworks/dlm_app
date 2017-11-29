/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Event } from 'models/event.model';
import { getEventEntityName } from 'utils/event-utils';
import { POLICY_EVENT, EVENT_RESULT_TYPE } from 'constants/event.constant';

@Component({
  selector: 'dlm-event-entity-link',
  template: `
    <span [ngClass]="{'text-primary': isActive, 'actionable': isActive}" (click)="handleClick()">
{{policyName}}
    </span>
  `
})
export class EventEntityLinkComponent implements OnInit {

  @Output() onClick = new EventEmitter<Event>();
  @Input() event: Event;

  get isActive(): boolean {
    return !(this.event.eventType === POLICY_EVENT && this.event.event === EVENT_RESULT_TYPE.DELETED) && this.event.policyExists;
  }

  get policyName(): string {
    return getEventEntityName(this.event);
  }

  constructor() { }

  ngOnInit() {
  }

  handleClick() {
    if (this.isActive) {
      this.onClick.emit(this.event);
    }
  }

}
