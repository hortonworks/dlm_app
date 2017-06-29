import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'dlm-duration-column',
  template: `
    <span *ngIf="isRunning; else durationTemplate">{{'jobs.duration.running' | translate}}</span>
    <ng-template #durationTemplate>
      <span *ngIf="isValidDate(duration); else invalidDate">
        <span>{{duration | amUtc | amDateFormat:'HH[h]mm[m]ss[s]'}}</span>
      </span>
      <ng-template #invalidDate>
        <i class="fa fa-minus"></i>
      </ng-template>
    </ng-template>
  `,
  styleUrls: ['./duration-column.component.scss'],
})
export class DurationColumnComponent {

  @Input() isRunning = false;
  @Input() duration;

  isValidDate(value) {
    return value !== undefined && value !== '' && value >= 0;
  }
}
