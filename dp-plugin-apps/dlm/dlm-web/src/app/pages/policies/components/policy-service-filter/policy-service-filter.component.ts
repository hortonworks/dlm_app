import { Component, EventEmitter, Output } from '@angular/core';
import { POLICY_TYPES, POLICY_TYPES_LABELS } from 'constants/policy.constant';

@Component({
  selector: 'policy-service-filter',
  templateUrl: './policy-service-filter.component.html',
  styleUrls: ['./policy-service-filter.component.scss']
})
export class PolicyServiceFilterComponent {

  activeService: '';

  POLICY_TYPES = POLICY_TYPES;
  POLICY_TYPES_LABELS = POLICY_TYPES_LABELS;

  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  filterPoliciesByService(service) {
    this.activeService = this.activeService === service ? '' : service;
    this.onFilter.emit(this.activeService);
  }

}
