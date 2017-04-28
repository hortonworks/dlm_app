import { Component, OnInit } from '@angular/core';
import { go } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers';
import { PolicyService } from 'services/policy.service';
import { resetFormValue } from 'actions/form.action';
import { getFormValues } from 'selectors/form.selector';
import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';
import { LoadCluster } from 'actions/cluster.action';

@Component({
  selector: 'dlm-review-policy',
  templateUrl: './review-policy.component.html',
  styleUrls: ['./review-policy.component.scss']
})
export class ReviewPolicyComponent implements OnInit {
  tDetails = 'page.policies.subpage.review.details';
  descriptionTranslateParam = {};
  // todo: this is mock. Not sure where we can get this info
  detailsInfo = [
    // this one probably can be get from cluster info
    {name: 'volume', label: this.t.instant(`${this.tDetails}.volume`), value: '234GB'},
    {name: 'transferTime', label: this.t.instant(`${this.tDetails}.transfer`), value: '11hrs 10mins'},
    {name: 'files', label: this.t.instant(`${this.tDetails}.files`), value: '121'},
    {name: 'destination', label: this.t.instant(`${this.tDetails}.destination`), value: '' }
  ];
  policyForm$: Observable<any>;
  private policyFormValue: any;

  constructor(private store: Store<State>, private t: TranslateService) {
    this.policyForm$ = store.select(getFormValues(POLICY_FORM_ID));
  }

  ngOnInit() {
    this.policyForm$.subscribe(policyForm => {
      const [targetCluster, destinationCluster] = policyForm.general.pair.split(',');

      this.descriptionTranslateParam = {
        ...this.descriptionTranslateParam,
        policyName: policyForm.general.name,
        targetCluster: targetCluster
      };
      this.detailsInfo.find(detail => detail.name === 'destination').value = destinationCluster;
    });
    this.store.dispatch(new LoadCluster('cluster1'));
  }

  submitReview() {
    this.store.dispatch(createPolicy(this.policyFormValue));
  }

  cancelReview() {
    this.store.dispatch(resetFormValue(POLICY_FORM_ID));
    this.store.dispatch(go(['policies/create']));
  }

}
