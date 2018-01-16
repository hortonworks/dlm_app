/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input } from '@angular/core';
import { CloudContainer } from 'models/cloud-container.model';
@Component({
  selector: 'dlm-select-cloud-destination',
  template: `
    <ul class="select-field-option-list list-unstyled">
      <li class="select-field-option-item no-hover">
        <p class="group-title">
          <i class="fa fa-cloud" aria-hidden="true"></i> {{ title | translate}}
        </p>
        <ul *ngIf="containers?.length">
          <li class="select-field-option-item" *ngFor="let container of containers"
              (click)="listItemClick(container)">
            {{container.name}}
          </li>
        </ul>
        <ul *ngIf="!containers?.length" class="empty-list">
          <li class="select-field-option-item no-hover">
            <em>{{'page.policies.form.no_containers' | translate}}</em>
          </li>
        </ul>
      </li>
    </ul>
  `,
  styleUrls: ['./select-cloud-destination.component.scss']
})
export class SelectCloudDestinationComponent {
  @Input() title: string;
  @Input() containers: CloudContainer[] = [];
  @Input() dropdownActionEmitter: EventEmitter<any>;

  listItemClick(container) {
    this.dropdownActionEmitter.next(container.id);
  }

}
