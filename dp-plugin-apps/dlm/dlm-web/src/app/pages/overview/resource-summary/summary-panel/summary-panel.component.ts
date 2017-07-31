import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dlm-summary-panel',
  template: `
    <div class="panel panel-default">
      <div class="panel-heading flex-center">
        <span class="panel-title">
          {{title | translate}}
          <i class="fa fa-question-circle text-info actionable" *ngIf="hint" [tooltip]="hint | translate"></i>
        </span>
        <span class="total-counter">{{total}}</span>
      </div>
      <div class="panel-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./summary-panel.component.scss']
})
export class SummaryPanelComponent implements OnInit {

  @Input() hint = '';
  @Input() title: string;
  @Input() total: string|number;

  constructor() { }

  ngOnInit() {
  }

}
