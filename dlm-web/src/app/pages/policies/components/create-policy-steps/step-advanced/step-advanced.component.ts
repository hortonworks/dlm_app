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


import {of as observableOf, combineLatest as observableCombineLatest,  Observable, Subscription } from 'rxjs';

import {distinctUntilChanged, map, pluck, switchMap} from 'rxjs/operators';
import {
  Component, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, Input
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { WIZARD_STEP_ID, SOURCE_TYPES, POLICY_TYPES } from 'constants/policy.constant';
import { getStepValue } from 'selectors/create-policy.selector';
import { isEqual } from 'utils/object-utils';
import { contains } from 'utils/array-util';
import { loadYarnQueues } from 'actions/yarnqueues.action';
import { getYarnQueueEntities } from 'selectors/yarn.selector';
import { SelectOption } from 'components/forms/select-field';
import { Cluster } from 'models/cluster.model';
import { SourceValue, DestinationValue, StepSourceValue, StepDestinationValue, StepGeneralValue } from 'models/create-policy-form.model';
import { getUnderlyingHiveFS, isClusterWithAtlas } from 'utils/cluster-util';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { Policy } from 'models/policy.model';

function isInteger(value: string): boolean {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0;
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    return isInteger(value) ? null : {'integerValidator': {name: value}};
  };
}

@Component({
  selector: 'dlm-step-advanced',
  templateUrl: './step-advanced.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepAdvancedComponent implements OnInit, OnDestroy, StepComponent {

  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-advanced';
  @Input() clusters: Cluster[] = [];
  @Input() policy: Policy;

  readonly stepId = WIZARD_STEP_ID.ADVANCED;
  form: FormGroup;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  yarnQueueList: SelectOption[] = [];
  subscriptions: Subscription[] = [];
  destination = null;
  queueNameHint: string;
  sourceSelector$: Observable<any>;
  destinationSelector$: Observable<any>;
  generalSelector$: Observable<StepGeneralValue>;
  maxBandwidthField = {
    fieldLabel: this.t.instant('page.policies.form.fields.max_bandwidth_name')
  };
  maxMapsField = {
    fieldLabel: this.t.instant('page.policies.form.fields.max_maps_name')
  };
  showDisableAtlasMetadata = false;

  constructor(
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private policyWizardService: PolicyWizardService,
    private t: TranslateService
  ) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      advanced: this.formBuilder.group({
        queue_name: [''],
        max_bandwidth: ['', integerValidator()],
        max_maps: ['', integerValidator()],
        disable_atlas: ['']
      })
    });
  }

  private setupEditMode(): void {
    if (this.policy) {
      this.policyWizardService.patchFormByStep(this.form, WIZARD_STEP_ID.ADVANCED, this.policy);
    }
  }

  ngOnInit() {
    this.form = this.initForm();
    this.generalSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.GENERAL));
    this.sourceSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.SOURCE)).pipe(
      pluck<StepSourceValue, SourceValue>('source'));
    this.destinationSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.DESTINATION)).pipe(
      pluck<StepDestinationValue, DestinationValue>('destination'));
    this.subscriptions.push(this.policyWizardService.publishValidationStatus(this, this.form));
    const sourceOrDestinationTypeChanges$ = observableCombineLatest(this.sourceSelector$,
      this.destinationSelector$,
      this.generalSelector$).pipe(
      switchMap(([source, destination, general]) => {
        let sourceType = null;
        let destinationType = null;
        const policyType = general && general.type || null;
        if (source && 'type' in source) {
          sourceType = source['type'];
        }
        if (destination && 'type' in destination) {
          destinationType = destination['type'];
        }
        if (sourceType && destinationType) {
          const destinationCluster = this.clusters.find(c => c.id === +destination.cluster);
          let clusterId;
          const sc = this.clusters.find(c => c.id === +source.cluster);
          const dc = this.clusters.find(c => c.id === +destination.cluster);
          const isHiveCloud = policyType === POLICY_TYPES.HIVE &&  contains([UnderlyingFsForHive.S3,
            UnderlyingFsForHive.WASB, UnderlyingFsForHive.GCS], getUnderlyingHiveFS(destinationCluster));
          if (destination.type === SOURCE_TYPES.CLUSTER) {
            clusterId = isHiveCloud ? sc.id : dc.id;
          } else {
            clusterId = sc.id;
          }
          const executionClusterName = this.clusters.find(c => c.id === +clusterId).name;
          this.queueNameHint = this.t.instant('page.policies.form.fields.queue_name_hint', {clusterName: executionClusterName});
          if (sourceType === SOURCE_TYPES.CLUSTER && contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB,
            SOURCE_TYPES.GCS], destinationType) || isHiveCloud) {
            return this.sourceSelector$;
          } else {
            return this.destinationSelector$;
          }
        }
        return observableOf({});
      }));
    this.subscriptions.push(this.updateAtlasFieldAccess());
    this.setupSourceDestinationChanges(sourceOrDestinationTypeChanges$);
    this.setupEditMode();
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    return this.form.value;
  }

  private updateAtlasFieldAccess(): Subscription {
    return observableCombineLatest(this.sourceSelector$, this.destinationSelector$)
      .subscribe(clusters => {
        const source = clusters[0];
        const destination = clusters[1];
        if ((source && 'type' in source) && (destination && 'type' in destination)) {
          const sc = this.clusters.find(c => c.id === +source.cluster);
          const dc = this.clusters.find(c => c.id === +destination.cluster);
          if (source.type === SOURCE_TYPES.CLUSTER && destination.type === SOURCE_TYPES.CLUSTER) {
            this.showDisableAtlasMetadata = isClusterWithAtlas(sc) && isClusterWithAtlas(dc);
          } else if (contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], destination.type)) {
            this.showDisableAtlasMetadata = isClusterWithAtlas(sc);
          } else {
            this.showDisableAtlasMetadata = false;
          }
        }
      });
  }

  private setupSourceDestinationChanges(sourceOrDestinationChange$: Observable<any>): void {
    const loadQueues = sourceOrDestinationChange$
      .subscribe((source) => {
        if (source) {
          const {cluster, type} = source;
          if (cluster && type === SOURCE_TYPES.CLUSTER) {
            this.store.dispatch(loadYarnQueues(cluster));
          }
        }
      });

    const makeQueueItem = (label: string, value: string = label): SelectOption => ({label, value});
    const createQueueList = (all, queue) => {
      const listItem = queue.path === 'root' ? [] : makeQueueItem(queue.name);
      if (queue.children.length) {
        return queue.children.reduce(createQueueList, all);
      }
      return all.concat(listItem);
    };

    const clusterQueues$ = observableCombineLatest(sourceOrDestinationChange$, this.store.select(getYarnQueueEntities)).pipe(
      map(([sourceOrDestination, entities]) =>
        (sourceOrDestination && 'cluster' in sourceOrDestination) ? entities[sourceOrDestination['cluster']] : []),
      distinctUntilChanged(isEqual), );

    const updateQueueList = clusterQueues$.subscribe(yarnQueues => {
      if (yarnQueues && yarnQueues.length) {
        this.yarnQueueList = yarnQueues[0].children ? yarnQueues.reduce(createQueueList, []) :
          [makeQueueItem(yarnQueues[0].path)];
        this.form.patchValue({
          advanced: {
            queue_name: this.yarnQueueList[0].value
          }
        });
      }
    });
    this.subscriptions.push(loadQueues);
    this.subscriptions.push(updateQueueList);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
