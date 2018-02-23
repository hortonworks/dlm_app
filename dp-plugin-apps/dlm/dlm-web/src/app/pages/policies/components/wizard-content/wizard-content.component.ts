/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, Input, ViewEncapsulation,
  HostBinding, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'dlm-wizard-content',
  styleUrls: ['./wizard-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-content">
      <h4 class="step-title">{{stepIndex}}. {{stepLabel}}</h4>
      <p class="step-description" *ngIf="stepDescription">{{stepDescription}}</p>
      <div class="panel panel-default">
        <div class="panel-body">
          <ng-content select="[wizard-content-body]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class WizardContentComponent {

  @Input() stepLabel: string;
  @Input() stepIndex: number;
  @Input() stepDescription: string;
  @HostBinding('class') className = 'dlm-wizard-content';

  constructor() {}
}
