import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dlm-policy-actions',
  templateUrl: './policy-actions.component.html',
  styleUrls: ['./policy-actions.component.scss']
})
export class PolicyActionsComponent {

  @Input() policyActions;
  @Input() policy;

  @Output() handler: EventEmitter<any> = new EventEmitter();

  private actionDisabled(policy, action) {
    return action.disabledFor === policy.status || action.enabledFor && policy.status !== action.enabledFor;
  }

  handleSelectedAction(policy, action) {
    if (!this.actionDisabled(policy, action)) {
      this.handler.emit({policy, action});
    }
  }
}
