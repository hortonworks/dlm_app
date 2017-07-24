import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'dlm-summary-panel-cell',
  template: `
    <div class="text-center">
      <p class="cell-label">
        <i [class]="iconClass"></i>
        <span class="text-muted">{{label}}</span>
      </p>
      <p class="cell-value" [class.btn-link]="actionable" [class.actionable]="actionable" (click)="handleCellClick($event)">
        {{value}}
      <p>
   </div>
  `,
  styleUrls: ['./summary-panel-cell.component.scss']
})
export class SummaryPanelCellComponent implements OnInit {

  @Input() label: string;
  @Input() value: number;
  @Input() iconClass: string;
  @Input() actionable = false;
  @Output() cellClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  handleCellClick(e: MouseEvent) {
    if (!this.actionable) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.cellClick.emit({ label: this.label, value: this.value });
  }

}
