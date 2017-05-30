import { Component, Input, ViewEncapsulation, HostBinding } from '@angular/core';
import { ProgressState } from 'models/progress-state.model';

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
  `,
})
export class ProgressContainerComponent {
  @Input() progressState: ProgressState;
  @HostBinding('class') componentClass = 'dlm-progress-container';
}
