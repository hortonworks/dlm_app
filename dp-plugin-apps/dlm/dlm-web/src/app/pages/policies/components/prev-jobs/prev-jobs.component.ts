import { Component, Input } from '@angular/core';
import { Policy } from 'models/policy.model';

@Component({
  selector: 'dlm-prev-jobs',
  templateUrl: './prev-jobs.component.html'
})
export class PrevJobsComponent {
  @Input()
  policy: Policy;
}
