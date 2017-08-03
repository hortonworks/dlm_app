import { Component, OnInit, Input, ViewEncapsulation, HostBinding } from '@angular/core';

@Component({
  selector: 'dlm-page-header',
  styleUrls: ['./page-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div>
      <div class="row">
        <div class="col-md-12">
          <i [class]="iconClass" *ngIf="iconClass"></i>
          <span class="page-title">
            {{title | translate}}
          </span>
          <i class="fa fa-question-circle help-note" *ngIf="contextMessage" [tooltip]="contextMessage | translate"></i>
        </div>
      </div>
      <div class="row" *ngIf="description">
        <div class="col-md-12">
          <div class="page-description">{{description | translate}}</div>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent implements OnInit {
  @Input() title = '';
  @Input() iconClass = '';
  @Input() description = '';
  @Input() contextMessage = '';
  @HostBinding('class') className = 'dlm-page-header';
  @HostBinding('class.flex-center') @Input() isFlexCenter = false;

  constructor() { }

  ngOnInit() {
  }

}
