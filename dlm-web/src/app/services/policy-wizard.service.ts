/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { UrlSegment } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { filter, distinctUntilKeyChanged, map, distinctUntilChanged, take, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { State } from 'reducers/index';
import { getStep } from 'selectors/create-policy.selector';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { Policy, PolicyDefinition, PolicyUpdatePayload } from 'models/policy.model';
import { CreatePolicyForm, CreatePolicyFormState, SerializedPolicy, PolicySerializeDependencies, StepName } from 'models/wizard.model';
import {
  StepGeneralValue,
  StepSourceValue,
  StepDestinationValue,
  StepScheduleValue,
  StepAdvancedValue,
  SourceValue,
  DestinationValue
} from 'models/create-policy-form.model';
import {
  POLICY_TYPES, SOURCE_TYPES, TDE_KEY_TYPE, POLICY_REPEAT_MODES, POLICY_START, POLICY_TIME_UNITS
} from 'constants/policy.constant';
import { makeNumber } from 'utils/number-utils';
import { omitEmpty, isEmpty } from 'utils/object-utils';
import { getUnderlyingHiveFS } from 'utils/cluster-util';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';
import { PolicyService } from 'services/policy.service';
import {
  addCloudPrefix,
  stripCloudPrefix,
  getSourceType,
  getDestinationType,
  getPolicyType,
  getCloudEndpoint
} from 'utils/policy-util';
import { TimeZoneService } from 'services/time-zone.service';
import { Cluster } from 'models/cluster.model';
import {contains} from '../utils/array-util';

export type IRoute = [UrlSegment[], {[key: string]: string}];

@Injectable()
export class PolicyWizardService {
  readonly whenEditMode = filter(([segments, _]: IRoute) => segments[0].path === 'edit');

  constructor(
    private store: Store<State>,
    private timeZone: TimeZoneService
  ) { }

  /**
   * Emits value when specified step become active
   *
   * @param stepId {string} wizard step id
   */
  activeStep$(stepId: string): Observable<any> {
    return this.store.select(getStep(stepId)).pipe(
      distinctUntilKeyChanged('state'),
      filter(step => step.state === 'active')
    );
  }

  publishValidationStatus(publisher: StepComponent, form: FormGroup): Subscription {
    const formValidation$ = form.statusChanges.pipe(
      map(_ => publisher.isFormValid()),
      distinctUntilChanged());
    return this.activeStep$(publisher.stepId).pipe(
      switchMap(_ => formValidation$)
    ).subscribe(isFormValid => publisher.onFormValidityChange.emit(isFormValid));
  }


  defaultEndTime(): Date {
    const date = moment();
    date.hours(23);
    date.minutes(59);
    date.seconds(59);
    return date.toDate();
  }

  defaultStartTime(): Date {
    const date = moment();
    date.hours(0);
    date.minutes(0);
    date.seconds(0);
    return date.toDate();
  }

  private mapGeneralValues(policy: Policy): StepGeneralValue {
    return {
      name: policy.name,
      description: policy.description,
      type: getPolicyType(policy)
    };
  }

  private isHiveCloud(policy: Policy): boolean {
    return getPolicyType(policy) === POLICY_TYPES.HIVE && policy.customProperties && !!policy.customProperties.cloudCred;
  }

  private getClusterId(cluster: Cluster): number {
    return cluster ? cluster.id : null;
  }

  private getS3Endpoint(policy: Policy) {
    const s3Dir = getCloudEndpoint(policy);
    return stripCloudPrefix(s3Dir);
  }

  private getCloudAccount(policy) {
    return policy.cloudCredentialResource && policy.cloudCredentialResource.id || '';
  }

  private mapSourceValues(policy: Policy): StepSourceValue {
    const type = getSourceType(policy);
    const cluster = this.getClusterId(policy.sourceClusterResource);
    const s3endpoint = this.getS3Endpoint(policy);
    const policyType = getPolicyType(policy);
    const cloudAccount = contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], type) ? this.getCloudAccount(policy) : '';

    return {
      source: {
        type,
        cluster,
        s3endpoint,
        cloudAccount,
        databases: policyType === POLICY_TYPES.HIVE ? policy.sourceDataset : '',
        directories: policyType === POLICY_TYPES.HDFS ? policy.sourceDataset : '',
        datasetEncrypted: false,
        cloudEncryption: null
      }
    };
  }

  private mapDestinationValues(policy: Policy): StepDestinationValue {
    const type = getDestinationType(policy);
    const cluster = this.getClusterId(policy.targetClusterResource);
    const s3endpoint = this.getS3Endpoint(policy);
    const cloudAccount = contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], type) || this.isHiveCloud(policy) ?
      this.getCloudAccount(policy) : '';

    return {
      destination: {
        type,
        cluster,
        s3endpoint,
        cloudAccount,
        path: policy.targetDataset,
        tdeKey: null,
        cloudEncryption: null,
        cloudEncryptionKey: ''
      }
    };
  }

  private parseFrequency(policy: Policy): {unit: string, day: string, frequency: number} {
    const duration = moment.duration(policy.frequency, 'seconds');
    const hasPrecision = (n) => ('' + n).split('.').length > 1;
    const isValid = (value) => value >= 1 && !hasPrecision(value);
    const weeks = duration.asWeeks();
    const days = duration.asDays();
    const hours = duration.asHours();

    if (isValid(weeks)) {
      let day = moment().add(weeks, 'weeks').day();
      if (this.deserializeTime(policy.startTime)) {
        day = moment(this.deserializeDate(policy.startTime)).add(weeks, 'weeks').day();
      } else if (policy.jobs && policy.jobs.length) {
        day = moment(this.deserializeDate(policy.jobs[0].startTime)).add(weeks, 'weeks').day();
      }
      return {
        unit: POLICY_TIME_UNITS.WEEKS,
        day: '' + day,
        frequency: weeks
      };
    } else if (isValid(days)) {
      return {
        unit: POLICY_TIME_UNITS.DAYS,
        day: '',
        frequency: days
      };
    } else if (isValid(hours)) {
      return {
        unit: POLICY_TIME_UNITS.HOURS,
        day: '',
        frequency: hours
      };
    }
    return {
      unit: POLICY_TIME_UNITS.MINUTES,
      day: '',
      frequency: duration.asMinutes()
    };
  }

  private isDateEmpty(date: string): boolean {
    return !date || date === '9999-12-31T00:00:00';
  }

  private deserializeDate(date: string, defaultValue = '') {
    return this.isDateEmpty(date) ? defaultValue : moment(date).format('YYYY-MM-DD').toString();
  }

  private deserializeTime(time: string, defaultValue = null): Date {
    return this.isDateEmpty(time) ? defaultValue : this.timeZone.formatDateTimeWithTimeZone(time, '');
  }

  private mapScheduleValues(policy: Policy): StepScheduleValue {
    const { day, unit, frequency } = this.parseFrequency(policy);
    return {
      job: {
        day,
        unit,
        frequency,
        start: POLICY_START.ON_SCHEDULE,
        repeatMode: POLICY_REPEAT_MODES.EVERY,
        frequencyInSec: policy.frequency,
        endTime: {
          date: this.deserializeDate(policy.endTime),
          time: this.deserializeTime(policy.endTime, this.defaultEndTime())
        },
        startTime: {
          date: this.deserializeDate(policy.startTime),
          time: this.deserializeTime(policy.startTime, this.defaultStartTime())
        }
      },
      userTimezone: ''
    };
  }

  private mapAdvancedValues(policy: Policy): StepAdvancedValue {
    return {
      advanced: {
        queue_name: policy.customProperties && policy.customProperties.queueName,
        max_bandwidth: makeNumber(policy.customProperties && policy.customProperties.distcpMapBandwidth, null),
        max_maps: makeNumber(policy.customProperties && policy.customProperties.distcpMaxMaps, null),
        disable_atlas: false
      }
    };
  }

  mapUpdatePayload(formsData: SerializedPolicy): PolicyUpdatePayload {
    const {policyData: {policyDefinition: {
      frequencyInSec,
      queueName,
      endTime,
      distcpMapBandwidth,
      startTime,
      distcpMaxMaps,
      plugins
    }}} = formsData;

    return omitEmpty({
      queueName,
      endTime,
      distcpMapBandwidth,
      startTime,
      frequencyInSec,
      distcpMaxMaps,
      plugins
    });
  }

  deserializePolicy(policy: Policy): CreatePolicyForm {
    return {
      general: this.mapGeneralValues(policy),
      source: this.mapSourceValues(policy),
      destination: this.mapDestinationValues(policy),
      schedule: this.mapScheduleValues(policy),
      advanced: this.mapAdvancedValues(policy)
    };
  }

  serializePolicy(formsData: CreatePolicyFormState, dependencies: PolicySerializeDependencies): SerializedPolicy {
    const { clusters } = dependencies;
    const {
      general: {value: general},
      source: {value: {source}},
      destination: {value: {destination}},
      schedule: {value: {job: schedule}},
      advanced: {value: {advanced}}
    } = formsData;

    const policyData = {
      policyDefinition: <PolicyDefinition>{
        type: general.type,
        name: general.name,
        description: general.description,
        sourceDataset: '',
        sourceCluster: '',
        targetCluster: '',
        targetDataset: '',
        repeatMode: schedule.repeatMode,
        frequencyInSec: schedule.frequencyInSec,
        startTime: this.formatDateValue(schedule.startTime),
        endTime: this.formatDateValue(schedule.endTime),
        queueName: advanced.queue_name,
        distcpMapBandwidth: null,
        distcpMaxMaps: null,
        cloudCred: ''
      }
    };

    if (source['enableSnapshotBasedReplication']) {
      policyData.policyDefinition['enableSnapshotBasedReplication'] = true;
    }

    let clusterId;
    const sc = clusters.find(c => c.id === source.cluster);
    const dc = clusters.find(c => c.id === destination.cluster);
    const isHiveCloud = general.type === POLICY_TYPES.HIVE && contains([UnderlyingFsForHive.S3,
      UnderlyingFsForHive.WASB], getUnderlyingHiveFS(dc));
    if (destination.type === SOURCE_TYPES.CLUSTER) {
      clusterId = isHiveCloud ? sc.id : dc.id;
      policyData.policyDefinition.targetCluster = PolicyService.makeClusterId(dc.dataCenter, dc.name);
      policyData.policyDefinition.targetDataset = destination.path;
      if (isHiveCloud) {
        policyData.policyDefinition.cloudCred = destination.cloudAccount;
      }
    } else {
      clusterId = sc.id;
      if (contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], destination.type)) {
        // destination s3
        policyData.policyDefinition.targetDataset = addCloudPrefix(destination.s3endpoint, destination.type);
        policyData.policyDefinition.cloudCred = destination.cloudAccount;
      }
    }

    if (source.type === SOURCE_TYPES.CLUSTER) {
      // source cluster
      let sourceDataset = '';
      policyData.policyDefinition.sourceCluster = PolicyService.makeClusterId(sc.dataCenter, sc.name);
      if (general.type === POLICY_TYPES.HDFS) {
        sourceDataset = source.directories;
      } else if (general.type === POLICY_TYPES.HIVE) {
        sourceDataset = source.databases;
      }
      policyData.policyDefinition.sourceDataset = sourceDataset;
    } else {
      if (contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], source.type)) {
        // source s3
        policyData.policyDefinition.sourceDataset = addCloudPrefix(source.s3endpoint, source.type);
        policyData.policyDefinition.cloudCred = source.cloudAccount;
      }
    }

    if (source.type === SOURCE_TYPES.CLUSTER && source.type === destination.type) {
      if (destination.tdeKey === TDE_KEY_TYPE.SAME_KEY) {
        policyData.policyDefinition['tde.sameKey'] = true;
      }
    }

    if (advanced.max_bandwidth) {
      policyData.policyDefinition.distcpMapBandwidth = Number(advanced.max_bandwidth);
    }
    policyData.policyDefinition.distcpMaxMaps = makeNumber(advanced.max_maps, null);
    if (advanced.disable_atlas) {
      const plugins = sc.beaconAdminStatus.plugins.filter(plugin => plugin !== 'ATLAS').join();
      policyData.policyDefinition['plugins'] = plugins;
    }
    if (source.type === SOURCE_TYPES.S3 && !!source.cloudEncryption) {
      const cloudEncryptionTarget: SourceValue = source || {} as SourceValue;
      policyData.policyDefinition['cloud.encryptionAlgorithm'] = cloudEncryptionTarget.cloudEncryption;
    } else if (destination.type === SOURCE_TYPES.S3 && !!destination.cloudEncryption) {
      const cloudEncryptionTarget: DestinationValue = destination || {} as DestinationValue;
      policyData.policyDefinition['cloud.encryptionAlgorithm'] = cloudEncryptionTarget.cloudEncryption;
      policyData.policyDefinition['cloud.encryptionKey'] = cloudEncryptionTarget.cloudEncryptionKey;
    }

    policyData.policyDefinition = <PolicyDefinition>omitEmpty(policyData.policyDefinition);
    return {
      policyData,
      clusterId
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

  isPolicyAlreadyRun(policy: Policy): boolean {
    return !!(policy && policy.jobs && policy.jobs.length);
  }

  patchFormByStep(form: FormGroup, stepId: StepName, policy: Policy) {
    this.store.select(getStep(stepId)).pipe(
      filter(step => !isEmpty(step.value)),
      take(1)
    ).subscribe(step => form.patchValue(step.value));
  }

}
