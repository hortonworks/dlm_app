import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { go } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers';
import { PolicyPayload, PolicyDefinition } from 'models/policy.model';
import { resetFormValue } from 'actions/form.action';
import { getFormValues } from 'selectors/form.selector';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { Pairing } from 'models/pairing.model';
import { loadPairings } from 'actions/pairing.action';
import { getPairing } from 'selectors/pairing.selector';
import { Cluster } from 'models/cluster.model';
import { bytesToSize } from 'utils/size-util';
import { POLICY_TYPES } from 'constants/policy.constant';
import { LoadCluster } from 'actions/cluster.action';
import { omitEmpty } from 'utils/object-utils';
import { ProgressState } from 'models/progress-state.model';
import { getProgressState } from 'selectors/progress.selector';
import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';

const CREATE_POLICY_REQUEST = 'CREATE_POLICY';

@Component({
  selector: 'dlm-review-policy',
  templateUrl: './review-policy.component.html',
  styleUrls: ['./review-policy.component.scss']
})
export class ReviewPolicyComponent implements OnInit, OnDestroy {
  @ViewChild('errorDetailsDialog') errorDetailsDialog: ModalDialogComponent;
  tDetails = 'page.policies.subpage.review.details';
  descriptionTranslateParam = {};
  // todo: this is mock. Not sure where we can get this info
  detailsInfo = [
    // this one probably can be get from cluster info
    {name: 'volume', label: this.t.instant(`${this.tDetails}.volume`), value: ''},
    {name: 'transferTime', label: this.t.instant(`${this.tDetails}.time`), value: '11hrs 10mins'},
    {name: 'files', label: this.t.instant(`${this.tDetails}.files`), value: '121'},
    {name: 'destination', label: this.t.instant(`${this.tDetails}.destination`), value: '' }
  ];
  policyForm$: Observable<any>;
  pairing$: Observable<Pairing>;
  sourceCluster: Cluster;
  targetCluster: Cluster;
  creationState: ProgressState;
  creationStateSubscription: Subscription;

  private policyFormValue: any;

  constructor(private store: Store<State>, private t: TranslateService) {
    this.policyForm$ = store.select(getFormValues(POLICY_FORM_ID));
    this.pairing$ = this.policyForm$
      .switchMap(policyForm => store.select(getPairing(policyForm.general.pair)));
    this.creationStateSubscription = store.select(getProgressState(CREATE_POLICY_REQUEST))
      .subscribe((progressState: ProgressState) => this.creationState = progressState);
  }

  ngOnInit() {
    Observable.combineLatest(this.policyForm$, this.pairing$)
    .subscribe(([policyForm, pairing]) => {
      if (!pairing) {
        return;
      }
      const [sourceCluster, targetCluster] = pairing.pair;
      this.sourceCluster = sourceCluster;
      this.targetCluster = targetCluster;
      this.policyFormValue = policyForm;

      this.descriptionTranslateParam = {
        ...this.descriptionTranslateParam,
        policyName: policyForm.general.name,
        sourceCluster: sourceCluster.name
      };

      this.getDetailsField('destination').value = targetCluster.name;
      this.getDetailsField('volume').value = bytesToSize(targetCluster.stats.CapacityTotal, 0);
    });
    this.store.dispatch(loadPairings());
  }

  ngOnDestroy() {
    this.creationStateSubscription.unsubscribe();
  }

  serializeFormValues(values): PolicyPayload {
    let sourceDataset;
    if (values.general.type === POLICY_TYPES.HDFS) {
      sourceDataset = values.directories;
    } else if (values.general.type === POLICY_TYPES.HIVE) {
      sourceDataset = values.databases.join(',');
    }
    const policyDefinition = <PolicyDefinition>omitEmpty({
      name: values.general.name,
      type: values.general.type,
      sourceCluster: this.sourceCluster.name,
      targetCluster: this.targetCluster.name,
      frequencyInSec: values.job.frequencyInSec,
      startTime: this.formatDateValue(values.job.startTime),
      endTime: this.formatDateValue(values.job.endTime),
      sourceDataset
    });
    return {
      policyDefinition,
      submitType: values.job.schedule
    };
  }

  formatDateValue(timeField) {
    if (!timeField.date) {
      return null;
    }
    return `${timeField.date}T${moment(timeField.time).format('HH:mm:ss')}`;
  }

  submitReview() {
    this.store.dispatch(createPolicy(this.serializeFormValues(this.policyFormValue), this.targetCluster.id, CREATE_POLICY_REQUEST));
  }

  cancelReview() {
    this.store.dispatch(resetFormValue(POLICY_FORM_ID));
    this.store.dispatch(go(['policies/create']));
  }

  getDetailsField(name: string) {
    return this.detailsInfo.find(detail => detail.name === name);
  }

  showErrorDetails(creationState: ProgressState) {
    this.errorDetailsDialog.show();
  }

}
