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

import {
  Component, Input, ViewEncapsulation, OnInit, OnDestroy,
  HostBinding, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { WIZARD_STEP_ID, POLICY_TYPES, POLICY_TYPES_LABELS, SOURCE_TYPES,
  POLICY_REPEAT_MODES, POLICY_DAYS_LABELS, POLICY_TIME_UNITS, POLICY_START } from 'constants/policy.constant';
import { getAllSteps, getAllStepValues } from 'selectors/create-policy.selector';
import { Step } from 'models/wizard.model';
import { SummaryTreeItem } from 'models/policy.model';
import { getStepById, isStepIdBefore } from 'utils/policy-util';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'utils/object-utils';
import { TranslateService } from '@ngx-translate/core';
import { Cluster } from 'models/cluster.model';
import * as moment from 'moment-timezone';
import { TimeZoneService } from 'services/time-zone.service';
import { FrequencyPipe, DETAILED } from 'pipes/frequency.pipe';

@Component({
  selector: 'dlm-wizard-summary-content',
  styleUrls: ['./create-policy-wizard-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="summary-panel-content">
      <div class="icon-wrapper">
        <div class="hexagon-service-icon icon-shifted white-border"
        [ngClass]="{'hexagon-warning': isHdfs, 'hexagon-success': isHive}">
          <i class="fa" [ngClass]="{'fa-file hdfs': isHdfs, 'fa-database hive': isHive}"></i>
        </div>
      </div>
      <div class="service-name" qe-attr="summary-service">{{POLICY_TYPES_LABELS[selectedServiceType]}}</div>
      <div *ngIf="showSummaryTree">
        <dlm-summary-tree [items]="summaryItems"></dlm-summary-tree>
      </div>
    </div>
  `
})

export class WizardSummaryComponent implements OnInit, OnDestroy {

  @Input() stepId: string;
  @Input() clusters: Cluster[] = [];
  @HostBinding('class') className = 'dlm-wizard-summary-content';
  subscriptions: Subscription[] = [];
  selectedServiceType = null;
  _steps: Step [] = [];
  _stepValues = {};
  summaryItems: SummaryTreeItem[] = [];
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  POLICY_TYPES = POLICY_TYPES;
  POLICY_TYPES_LABELS = POLICY_TYPES_LABELS;
  POLICY_REPEAT_MODES = POLICY_REPEAT_MODES;
  POLICY_DAYS_LABELS = POLICY_DAYS_LABELS;
  POLICY_TIME_UNITS = POLICY_TIME_UNITS;

  constructor(private store: Store<State>,
              private ref: ChangeDetectorRef,
              private t: TranslateService,
              private frequencyPipe: FrequencyPipe,
              private timeZone: TimeZoneService) {}

  ngOnInit () {
    const stepValues$ = this.store.select(getAllStepValues);
    const stepValuesSubscription$ = stepValues$.subscribe(values => {
      this._stepValues = values || {};
      if (this.WIZARD_STEP_ID.GENERAL in this._stepValues && 'type' in this._stepValues[this.WIZARD_STEP_ID.GENERAL]) {
        this.selectedServiceType = this._stepValues[this.WIZARD_STEP_ID.GENERAL]['type'];
      }
      this.ref.detectChanges();
    });

    const wizardSteps$ = this.store.select(getAllSteps);
    const wizardStepsSubscription$ = wizardSteps$.subscribe(steps => {
      this._steps = steps;
    });

    const dataChanges$ = Observable.combineLatest(stepValues$, wizardSteps$);
    const loadSummary$ = dataChanges$
      .distinctUntilChanged(isEqual)
      .subscribe(([stepValues, steps]) => {
        this.summaryItems = [];
        if (this.showSummaryTree) {
          // Summary for step 'general' is shown by default
          const general = stepValues[this.WIZARD_STEP_ID.GENERAL];
          if (this.WIZARD_STEP_ID.GENERAL in stepValues) {
            if ('name' in general) {
              this.summaryItems.push({
                label: this.t.instant('page.policies.form.fields.policy_name.label'),
                value: general['name'],
                iconClass: 'fa-list-alt'
              });
            }
          }
          if (this.shouldShowStepSummaryFor(this.WIZARD_STEP_ID.SOURCE, stepValues, steps)) {
            const source = stepValues[this.WIZARD_STEP_ID.SOURCE]['source'];
            if (source) {
              let name = '';
              let path = '';
              const iconClass = source['type'] === SOURCE_TYPES.S3 ? 'fa-cloud' : 'fa-cube';
              if (source['type'] === SOURCE_TYPES.CLUSTER && 'cluster' in source) {
                const sourceCluster = this.clusters.find(cluster => cluster.id === source['cluster']);
                name = sourceCluster.name || '';
                path = this.selectedServiceType === POLICY_TYPES.HDFS ? source['directories'] : source['databases'] || '';
              } else if (source['type'] === SOURCE_TYPES.S3) {
                name = source['cloudAccount'] || '';
                path = 's3://' + source['s3endpoint'];
              }
              this.summaryItems.push({
                label: this.t.instant('common.source'),
                value: `${name} ${path}`,
                iconClass
              });
            }
          }
          if (this.shouldShowStepSummaryFor(this.WIZARD_STEP_ID.DESTINATION, stepValues, steps)) {
            const destination = stepValues[this.WIZARD_STEP_ID.DESTINATION]['destination'];
            if (destination) {
              let name = '';
              let path = '';
              const iconClass = destination['type'] === SOURCE_TYPES.S3 ? 'fa-cloud' : 'fa-cube';
              if (destination['type'] === SOURCE_TYPES.CLUSTER && 'cluster' in destination) {
                const sourceCluster = this.clusters.find(cluster => cluster.id === destination['cluster']);
                name = sourceCluster.name || '';
                path = destination['path'] || '';
              } else if (destination['type'] === SOURCE_TYPES.S3) {
                name = destination['cloudAccount'] || '';
                path = 's3://' + destination['s3endpoint'];
              }
              this.summaryItems.push({
                label: this.t.instant('common.destination'),
                value: `${name} ${path}`,
                iconClass
              });
            }
          }
          if (this.shouldShowStepSummaryFor(this.WIZARD_STEP_ID.SCHEDULE, stepValues, steps)) {
            const schedule = stepValues[this.WIZARD_STEP_ID.SCHEDULE];
            if (schedule && 'job' in schedule && 'userTimezone' in schedule) {
              const repeatMode = schedule.job.repeatMode;
              const timezone = schedule.userTimezone;
              const formattedEndTime = this.formatDateDisplay(schedule.job.endTime, timezone);
              const formattedStartTime = this.formatDateDisplay(schedule.job.startTime, timezone);
              let displayValue = '';
              if (repeatMode === this.POLICY_REPEAT_MODES.EVERY) {
                let value = this.frequencyPipe.transform(schedule.job.frequencyInSec, DETAILED);
                if (schedule.job.unit === this.POLICY_TIME_UNITS.WEEKS) {
                  value += ' on ' + this.POLICY_DAYS_LABELS[schedule.job.day];
                }
                displayValue = `${this.t.instant('page.policies.form.fields.repeat')} ${value}`;
              }
              if (schedule.job.start === POLICY_START.START_NOW) {
                displayValue += ` ${this.t.instant('common.starting_now')}`;
              } else if (formattedStartTime) {
                displayValue += ` ${this.t.instant('common.starting')} ${formattedStartTime}`;
              }
              if (formattedEndTime) {
                displayValue += ` ${this.t.instant('common.until')}  ${formattedEndTime}`;
              }
              this.summaryItems.push({
                label: this.t.instant('common.schedule'),
                value: displayValue,
                iconClass: 'fa-calendar'
              });
            }
          }
        }
      });

    this.subscriptions.push(stepValuesSubscription$);
    this.subscriptions.push(wizardStepsSubscription$);
    this.subscriptions.push(loadSummary$);
  }

  get isHdfs() {
    return this.selectedServiceType && this.selectedServiceType === this.POLICY_TYPES.HDFS;
  }

  get isHive() {
    return this.selectedServiceType && this.selectedServiceType === this.POLICY_TYPES.HIVE;
  }

  get showSummaryTree(): boolean {
    if (this.stepId && this._steps.length) {
      const step = getStepById(this._steps, this.stepId);
      return !!(step && step.previousStepId !== null);
    }
    return false;
  }

  shouldShowStepSummaryFor(stepId: string, stepValues, steps: Step[]): boolean {
    return stepId in stepValues && isStepIdBefore(steps, stepId, this.stepId);
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
    return timezone ? dateTime.tz(this.timeZone.defaultServerTimezone).format('lll') : dateTime.format('lll');
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
    return `${formattedDateValue} ${trimmedTimezone}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
