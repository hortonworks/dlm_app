/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount } from 'models/cloud-account.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { POLICY_TYPES, WIZARD_STEP_ID } from 'constants/policy.constant';
import { getStep, getSteps } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { S3 } from 'constants/cloud.constant';
import { mapToList } from 'utils/store-util';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { Subscription } from 'rxjs/Subscription';

const CLUSTER = 'CLUSTER';

@Component({
  selector: 'dlm-step-destination',
  templateUrl: './step-destination.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepDestinationComponent implements OnInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() beaconStatuses: BeaconAdminStatus[] = [];
  @Input() containersList: CloudContainer[] = [];
  subscriptions: Subscription[] = [];
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-destination';

  CLUSTER = CLUSTER;
  S3 = S3;
  form: FormGroup;
  source: any = {};
  general: any = {};
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  POLICY_TYPES = POLICY_TYPES;
  DESTINATION_TYPES = [CLUSTER, S3];
  /**
   * List of field-names related to cluster (source or destination)
   *
   * @type {string[]}
   */
  clusterFields = ['cluster', 'path'];

  /**
   * List of field-names related to cloud (source or destination)
   *
   * @type {string[]}
   */
  s3Fields = ['cloudAccount', 's3endpoint'];

  get destinationType() {
    return this.form.value.destination.type;
  }

  private filterCloudAccounts(provider) {
    return this.accounts
      .filter(a => a.accountDetails.provider === provider)
      .map(a => ({label: a.accountDetails['userName'] || a.accountDetails['accountName'], value: a.id}));
  }

  get destinationCloudAccounts() {
    return this.filterCloudAccounts(this.form.value.destination.type);
  }

  get destinationClusters() {
    const sourceType = this.source.type;
    if (sourceType === CLUSTER) {
      if (this.source.cluster) {
        const pairings = this.pairings.filter(pairing => pairing.pair.filter(cluster => +cluster.id === +this.source.cluster).length);
        if (pairings.length) {
          const clusterEntities = this.getClusterEntities(pairings);
          // Remove source cluster from the entities
          delete clusterEntities[this.source.cluster];
          return mapToList(clusterEntities);
        }
        return [{
          label: this.t.instant('page.policies.form.fields.destinationCluster.noPair'),
          value: ''
        }];
      }
      return [{
        label: this.t.instant('page.policies.form.fields.destinationCluster.default'),
        value: ''
      }];
    }
    return this.clusters.filter(cluster => {
      const status = this.beaconStatuses.find(c => c.clusterId === cluster.id);
      return status ? status.beaconAdminStatus.replication_cloud_fs : false;
    }).map(cluster => this.clusterToListOption(cluster));
  }

  getClusterEntities(pairings) {
    return pairings.reduce((entities: { [id: number]: {} }, entity: Pairing) => {
      const getClusters = (pairing) => {
        return pairing.pair.reduce((clusters: {}, cluster) => {
          return Object.assign({}, clusters, {
            [cluster.id]: this.clusterToListOption(cluster)
          });
        }, {});
      };
      return Object.assign({}, entities, getClusters(entity));
    }, {});
  }

  clusterToListOption(cluster) {
    return {
      label: `${cluster.name} (${cluster.dataCenter})`,
      value: cluster.id
    };
  }

  /**
   * List of Destination Type options
   * Only Cluster can be a Destination for HIVE Policy
   * Only Cluster can be a Destination for Cloud Source
   * If Source Cluster has `replicationCloudFS` set to `true` both Cluster and Cloud may be a Destination,
   * otherwise only Cluster can be used
   *
   * @type {{label: string, value: string}}[]
   */
  get destinationTypes() {
    const sourceClusterId = this.source.cluster;
    const onlyCluster = [{
      label: this.CLUSTER,
      value: this.CLUSTER
    }];
    if (this.general.type === POLICY_TYPES.HIVE || this.source.type === this.S3) {
      return onlyCluster;
    }
    const status = this.beaconStatuses.find(c => c.clusterId === sourceClusterId);
    const replicationCloudFS = status ? status.beaconAdminStatus.replication_cloud_fs : false;
    return replicationCloudFS ? this.DESTINATION_TYPES.map(dt => ({label: dt, value: dt})) : onlyCluster;
  }

  constructor(private store: Store<State>, private formBuilder: FormBuilder, private t: TranslateService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      destination: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: [''],
        cloudAccount: [''],
        s3endpoint: [''],
        path: ['', Validators.required],
      })
    });
  }

  /**
   * Reset destination form group if Source Type is changed
   * Reset other fields in the Source form group
   * Enable `directories`-field for Cluster and disable it for Cloud
   */
  private subscribeToDestinationType() {
    const destinationControls = this.form.controls.destination['controls'];
    const subscription = destinationControls.type.valueChanges.subscribe(type => {
      let toEnable = [], toDisable = [];
      if (type === S3) {
        toEnable = this.s3Fields;
        toDisable = this.clusterFields;
      }
      if (type === CLUSTER) {
        toEnable = this.clusterFields;
        toDisable = this.s3Fields;
      }
      toDisable.forEach(p => destinationControls[p].disable());
      toEnable.forEach(p => destinationControls[p].enable());
    });
    this.subscriptions.push(subscription);
  }

  ngOnInit() {
    this.form = this.initForm();
    this.store.select(getSteps(this.WIZARD_STEP_ID.GENERAL, this.WIZARD_STEP_ID.SOURCE)).subscribe(([general, source]) => {
      const controls = this.form.controls.destination['controls'];
      this.general = general.value || {};
      if (this.general.type === POLICY_TYPES.HIVE) {
        controls.path.disable();
      }
      this.source = source.value && source.value.source || {};
      if (this.source.type === CLUSTER) {
        this.form.patchValue({
          destination: {
            path: this.source.directories
          }
        });
        if (this.general.type !== POLICY_TYPES.HIVE) {
          controls.path.enable();
        }
      } else {
        this.form.patchValue({destination: {path: ''}});
      }
    });
    this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    this.subscribeToDestinationType();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    return this.form.value;
  }
}
