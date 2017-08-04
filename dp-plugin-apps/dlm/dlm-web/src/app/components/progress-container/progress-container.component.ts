/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ViewEncapsulation, HostBinding } from '@angular/core';
import { ProgressState } from 'models/progress-state.model';

/**
 * This component wraps passed content with loading indicator.
 *
 * Attention!!!
 * Passed content like components will be initialized for any circumstances even
 * when `progressState` indicates that view is in progress. This is because of <ng-content> behavior.
 * This means that if your component depends on some DOM node present in document's DOM
 * and you expect that component may break on init stage, you need to wrap this component with *ngIf by yourself
 * to control component initialization.
 *
 * For more info please check: https://github.com/angular/angular/issues/13921
 */
@Component({
  selector: 'dlm-progress-container',
  styleUrls: ['./progress-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="progress-container-wrapper">
      <ng-content *ngIf="!progressState?.isInProgress"></ng-content>
      <div class="progress-container-waiting" *ngIf="progressState?.isInProgress">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
    </div>
  `
})
export class ProgressContainerComponent {
  @Input() progressState: ProgressState;
  @HostBinding('class') componentClass = 'dlm-progress-container';
}
