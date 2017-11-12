/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { go } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';

import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers';
import { PolicyPayload, PolicyDefinition } from 'models/policy.model';
import { resetProgressState } from 'actions/progress.action';
import { resetFormValue } from 'actions/form.action';
import { getFormValues } from 'selectors/form.selector';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { loadPairings } from 'actions/pairing.action';
import { loadClusters } from 'actions/cluster.action';
import { Cluster } from 'models/cluster.model';
import { POLICY_TYPES, POLICY_TYPES_LABELS, POLICY_DAYS_LABELS, POLICY_REPEAT_MODES,
  POLICY_REPEAT_MODES_LABELS, POLICY_TIME_UNITS } from 'constants/policy.constant';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { omitEmpty, isEmpty } from 'utils/object-utils';
import { ProgressState } from 'models/progress-state.model';
import { getProgressState } from 'selectors/progress.selector';
import { POLICY_FORM_ID } from 'pages/policies/components/policy-form/policy-form.component';
import { getCluster } from 'selectors/cluster.selector';
import { TimeZoneService } from 'services/time-zone.service';
import { PolicyService } from 'services/policy.service';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { truncate } from 'pipes/truncate.pipe';

const CREATE_POLICY_REQUEST = 'CREATE_POLICY';

@Component({
  selector: 'dlm-review-policy',
  templateUrl: './review-policy.component.html',
  styleUrls: ['./review-policy.component.scss']
})
export class ReviewPolicyComponent implements OnInit, OnDestroy {
  @ViewChild('errorDetailsDialog') errorDetailsDialog: ModalDialogComponent;
  private subscriptions: Subscription[] = [];
  tDetails = 'page.policies.form.fields';
  descriptionTranslateParam = {};
  detailsInfo = [];
  policyTypes = POLICY_TYPES;
  policyTypesLabels = POLICY_TYPES_LABELS;
  policyRepeatModes = POLICY_REPEAT_MODES;
  policyRepeatModesLabels = POLICY_REPEAT_MODES_LABELS;
  policyTimeUnits = POLICY_TIME_UNITS;
  policyDaysLabels = POLICY_DAYS_LABELS;
  policyForm$: Observable<any>;
  sourceCluster: Cluster;
  targetCluster: Cluster;
  creationState: ProgressState;
  sourceCluster$: Observable<Cluster>;
  destinationCluster$: Observable<Cluster>;

  private policyFormValue: any;

  constructor(
    private store: Store<State>,
    private t: TranslateService,
    private frequencyPipe: FrequencyPipe,
    private timeZone: TimeZoneService
  ) {
    this.policyForm$ = store.select(getFormValues(POLICY_FORM_ID))
      .filter(policyForm => !isEmpty(policyForm));
    this.sourceCluster$ = this.policyForm$
      .switchMap(policyForm => store.select(getCluster(policyForm.general.sourceCluster)));
    this.destinationCluster$ = this.policyForm$
      .switchMap(policyForm => store.select(getCluster(policyForm.general.destinationCluster)));
    this.subscriptions.push(store
      .select(getProgressState(CREATE_POLICY_REQUEST))
      .subscribe((progressState: ProgressState) => this.creationState = progressState));
    this.store.dispatch(resetProgressState(CREATE_POLICY_REQUEST));
    this.store.dispatch(loadPairings());
    this.store.dispatch(loadClusters());
  }

  ngOnInit() {
    this.subscriptions.push(
      Observable.combineLatest(this.policyForm$, this.sourceCluster$, this.destinationCluster$)
        .filter(([policyForm, sourceCluster, destinationCluster]) => sourceCluster && destinationCluster && !isEmpty(policyForm))
        .subscribe(([policyForm, sourceCluster, destinationCluster]) => {
          this.sourceCluster = sourceCluster;
          this.targetCluster = destinationCluster;
          this.policyFormValue = policyForm;

          this.descriptionTranslateParam = {
            ...this.descriptionTranslateParam,
            policyName: policyForm.general.name,
            sourceCluster: sourceCluster.name
          };
          this.setDetails(sourceCluster, destinationCluster, policyForm);
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  serializeFormValues(values): PolicyPayload {
    let sourceDataset;
    if (values.general.type === this.policyTypes.HDFS) {
      sourceDataset = values.directories;
    } else if (values.general.type === this.policyTypes.HIVE) {
      sourceDataset = values.databases;
    }
    const maxBandwidth = values.advanced.max_bandwidth ? +values.advanced.max_bandwidth : '';
    const policyDefinition = <PolicyDefinition>omitEmpty({
      name: values.general.name,
      type: values.general.type,
      description: values.general.description,
      sourceCluster: PolicyService.makeClusterId(this.sourceCluster.dataCenter, this.sourceCluster.name),
      targetCluster: PolicyService.makeClusterId(this.targetCluster.dataCenter, this.targetCluster.name),
      frequencyInSec: values.job.frequencyInSec,
      startTime: this.formatDateValue(values.job.startTime),
      endTime: this.formatDateValue(values.job.endTime),
      sourceDataset,
      distcpMapBandwidth: maxBandwidth,
      queueName: values.advanced.queue_name
    });
    return {
      policyDefinition,
      submitType: values.job.schedule
    };
  }

  formatDateValue(timeField, timezone = true) {
    if (!timeField.date) {
      return null;
    }
    const dateTime = moment(timeField.date);
    const time = new Date(timeField.time);
    dateTime.hours(time.getHours());
    dateTime.minutes(time.getMinutes());
    dateTime.seconds(time.getSeconds());
    return timezone ? dateTime.tz(this.timeZone.defaultServerTimezone).format() : dateTime.format();
  }

  formatDateDisplay(timeField, timezone) {
    if (!timeField.date) {
      return null;
    }
    // timezone string is like
    // (UTC-07:00 PDT) America / Dawson, Ensenada, Los Angeles, Santa Isabel, Tijuana, Vancouver, Whitehorse
    // Trim it to first 15 characters to extract (UTC-07:00 PDT)
    const trimmedTimezone = timezone.substring(0, 15);
    const formattedDateValue = this.formatDateValue(timeField, false);
    return `${timeField.date} ${moment(formattedDateValue).format('HH:mm')} ${trimmedTimezone}`;
  }

  submitReview() {
    const formValue: PolicyPayload = this.serializeFormValues(this.policyFormValue);
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: this.t.instant('page.policies.success.title'),
        body: this.t.instant('page.policies.success.body', {
          policyName: truncate(formValue.policyDefinition.name, 25)
        })
      }
    };
    const meta = {
      requestId: CREATE_POLICY_REQUEST,
      notification
    };
    this.store.dispatch(createPolicy(formValue, this.targetCluster.id, meta));
  }

  cancelReview() {
    this.store.dispatch(go(['policies/create']));
  }

  getDetailsField(name: string) {
    return this.detailsInfo.find(detail => detail.name === name);
  }

  showErrorDetails(creationState: ProgressState) {
    this.errorDetailsDialog.show();
  }

  setDetails(sourceCluster: Cluster, destinationCluster: Cluster, policyForm) {
    const type = policyForm.general.type;
    const repeatMode = policyForm.job.repeatMode;
    const timezone = policyForm.userTimezone;
    const formattedEndTime = this.formatDateDisplay(policyForm.job.endTime, timezone);
    const formattedStartTime = this.formatDateDisplay(policyForm.job.startTime, timezone);
    const details = [
      {name: 'name', label: this.t.instant(`${this.tDetails}.policy_name`), value: policyForm.general.name},
      {name: 'description', label: this.t.instant(`${this.tDetails}.policy_description`), value: policyForm.general.description},
      {name: 'sourceCluster', label: this.t.instant('common.source'), value: `${sourceCluster.dataCenter} / ${sourceCluster.name}`},
      {name: 'destinationCluster', label: this.t.instant('common.destination'),
        value: `${destinationCluster.dataCenter} / ${destinationCluster.name}`},
      {name: 'type', label: this.t.instant(`${this.tDetails}.service`), value: this.policyTypesLabels[type]}
    ];
    if (type === this.policyTypes.HDFS) {
      details.push({name: 'directories', label: this.t.instant(`${this.tDetails}.directories`), value: policyForm.directories});
    } else if (type === this.policyTypes.HIVE) {
      details.push({name: 'databases', label: this.t.instant(`${this.tDetails}.databases`), value: policyForm.databases});
    }
    if (repeatMode === this.policyRepeatModes.EVERY) {
      let value = this.frequencyPipe.transform(policyForm.job.frequencyInSec);
      if (policyForm.job.unit === this.policyTimeUnits.WEEKS) {
        value += ' on ' + this.policyDaysLabels[policyForm.job.day];
      }
      details.push({name: 'repeatMode', label: this.t.instant(`${this.tDetails}.repeat`), value});
    }
    if (formattedStartTime) {
      details.push({
        name: 'startTime', label: this.t.instant('common.start_time'),
        value: formattedStartTime
      });
    }
    if (formattedEndTime) {
      details.push({
        name: 'EndTime', label: this.t.instant('common.end_time'),
        value: formattedEndTime
      });
    }
    if (policyForm.advanced.queue_name) {
      details.push({name: 'queue_name', label: this.t.instant('common.queue_name'), value: policyForm.advanced.queue_name});
    }
    if (policyForm.advanced.max_bandwidth) {
      details.push({name: 'max_bandwidth', label: this.t.instant('common.max_bandwidth'),
        value: policyForm.advanced.max_bandwidth + ' MBps'});
    }
    this.detailsInfo = details;
  }
}
