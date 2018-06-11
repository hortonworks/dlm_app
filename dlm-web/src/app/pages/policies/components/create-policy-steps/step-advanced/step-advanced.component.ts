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
  Component, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, Input
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { WIZARD_STEP_ID, SOURCE_TYPES, POLICY_TYPES } from 'constants/policy.constant';
import { getStepValue } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'utils/object-utils';
import { loadYarnQueues } from 'actions/yarnqueues.action';
import { getYarnQueueEntities } from 'selectors/yarn.selector';
import { SelectOption } from 'components/forms/select-field';
import { Cluster } from 'models/cluster.model';
import { SourceValue, DestinationValue, StepSourceValue, StepDestinationValue, StepGeneralValue } from 'models/create-policy-form.model';
import { getUnderlyingHiveFS } from 'utils/cluster-util';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';

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

  form: FormGroup;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  yarnQueueList: SelectOption[] = [];
  subscriptions: Subscription[] = [];
  destination = null;
  sourceSelector$: Observable<any>;
  destinationSelector$: Observable<any>;
  generalSelector$: Observable<StepGeneralValue>;

  constructor(private store: Store<State>, private formBuilder: FormBuilder, private t: TranslateService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      advanced: this.formBuilder.group({
        queue_name: [''],
        max_bandwidth: ['', integerValidator()]
      })
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.generalSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.GENERAL));
    this.sourceSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.SOURCE))
      .pluck<StepSourceValue, SourceValue>('source');
    this.destinationSelector$ = this.store.select(getStepValue(this.WIZARD_STEP_ID.DESTINATION))
      .pluck<StepDestinationValue, DestinationValue>('destination');
    const formSubscription = this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    const sourceOrDestinationTypeChanges$ = Observable.combineLatest(this.sourceSelector$,
      this.destinationSelector$,
      this.generalSelector$)
      .switchMap(([source, destination, general]) => {
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
          const isHiveCloud = policyType === POLICY_TYPES.HIVE && getUnderlyingHiveFS(destinationCluster) === UnderlyingFsForHive.S3;
          if (sourceType === SOURCE_TYPES.CLUSTER && destinationType === SOURCE_TYPES.S3 || isHiveCloud) {
            return this.sourceSelector$;
          } else {
            return this.destinationSelector$;
          }
        }
        return Observable.of({});
      });
    this.setupSourceDestinationChanges(sourceOrDestinationTypeChanges$);
    this.subscriptions.push(formSubscription);
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    return this.form.value;
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

    const clusterQueues$ = Observable.combineLatest(sourceOrDestinationChange$, this.store.select(getYarnQueueEntities))
      .map(([sourceOrDestination, entities]) =>
        (sourceOrDestination && 'cluster' in sourceOrDestination) ? entities[sourceOrDestination['cluster']] : [])
      .distinctUntilChanged(isEqual);

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
