/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
  yarnQueueList: any[] = [];
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

    const makeQueueItem = (path: String): SelectOption => ({label: path, value: path});
    const createQueueList = (all, queue) => {
      const listItem = queue.path === 'root' ? [] : makeQueueItem(queue.path.replace(/^root\./, ''));
      if (queue.children.length) {
        return queue.children.reduce(createQueueList, all.concat(listItem));
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
