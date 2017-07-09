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
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      if (this.isOpen) {
        this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
      }
    }
  }

  constructor(private elementRef: ElementRef) { }

  private actionDisabled(policy, action) {
    return action.disabledFor === policy.status || action.enabledFor && policy.status !== action.enabledFor;
  }

  handleSelectedAction(policy, action) {
    this.toggleDropDown();
    if (!this.actionDisabled(policy, action)) {
      this.handler.emit({policy, action});
    }
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
  }
}
