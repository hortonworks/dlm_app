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

import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { POLICY_MODES, SOURCE_TYPES } from 'constants/policy.constant';
import { TranslateService } from '@ngx-translate/core';
import { Policy } from 'models/policy.model';
import { isCloudPolicy, getSourceType, getDestinationType, getCloudProvider, isHiveCloud } from 'utils/policy-util';
import { contains } from 'utils/array-util';
import { FlowPicContext } from './flow-status.type';
import { CLOUD_PROVIDER_LABELS } from 'constants/cloud.constant';

@Component({
  selector: 'dlm-flow-status',
  template: `
    <div class="flow-status">
      <div class="flow-status-chart">
        <div class="flow-source">
          <ng-container *ngTemplateOutlet="flowPic;context:sourceContext"></ng-container>
        </div>
        <div class="flow-line"><span class="caret"></span></div>
        <div class="flow-destination">
          <span [tooltip]="warnMessage | translate" container="body">
            <ng-container *ngTemplateOutlet="flowPic;context:destinationContext"></ng-container>
          </span>
        </div>
      </div>
    </div>
    <ng-template #flowPic let-type="type" let-provider="cloudProvider">
      <div class="flow-type-cluster" *ngIf="isClusterType(type); else cloud"></div>
      <ng-template #cloud>
        <i class="fa fa-cloud"></i>
      </ng-template>
      <div class="flow-cloud-provider" [ngClass]="{'for-cluster': isClusterType(type)}" *ngIf="provider">
        {{provider}}
      </div>
      <div class="flow-ranger-warn" *ngIf="showWarning">
        <i class="text-warning fa fa-exclamation-triangle"></i>
      </div>
    </ng-template>
  `,
  styleUrls: ['./flow-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowStatusComponent {
  private translateNS = 'page.policies.flow_status';
  POLICY_MODES = POLICY_MODES;
  @Input() policy: Policy;

  get accessMode(): POLICY_MODES {
    return this.policy.hasOwnProperty('accessMode') ? this.policy.accessMode : POLICY_MODES.READ_WRITE;
  }

  get showWarning(): boolean {
    // show ranger warning message only if target is a cluster and
    // if the access is READ_WRITE
    return this.accessMode === POLICY_MODES.READ_WRITE && !!this.policy.targetCluster;
  }

  get warnMessage(): string {
    return this.showWarning ? 'page.policies.flow_status.ranger_disabled_tooltip' : '';
  }

  get modeTranslate(): string {
    return this.t.instant({
      [POLICY_MODES.READ_ONLY]: `${this.translateNS}.read_only`,
      [POLICY_MODES.READ_WRITE]: `${this.translateNS}.read_write`,
    }[this.accessMode] || ' ');
  }

  get modeAbbrev(): string {
    return this.t.instant({
      [POLICY_MODES.READ_ONLY]: `${this.translateNS}.read_only_abbrev`,
      [POLICY_MODES.READ_WRITE]: `${this.translateNS}.read_write_abbrev`,
    }[this.accessMode] || ' ');
  }

  get cloudProvider(): string {
    const provider = getCloudProvider(this.policy);
    return provider ? CLOUD_PROVIDER_LABELS[provider] : null;
  }


  get isCloudReplication(): boolean {
    return isCloudPolicy(this.policy);
  }

  get sourceContext(): FlowPicContext {
    const type = getSourceType(this.policy);
    const cloudProvider = type !== SOURCE_TYPES.CLUSTER ? this.cloudProvider : null;

    return {
      type,
      cloudProvider
    };
  }

  get destinationContext(): FlowPicContext {
    const type = getDestinationType(this.policy);
    const cloudProvider = type === SOURCE_TYPES.CLUSTER && isHiveCloud(this.policy) ||
      contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], type) ? this.cloudProvider : null;

    return {
      type,
      cloudProvider
    };
  }

  isClusterType(type: SOURCE_TYPES): boolean {
    return type === SOURCE_TYPES.CLUSTER;
  }

  isCloudType(type: SOURCE_TYPES): boolean {
    return contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB], type);
  }

  constructor(private t: TranslateService) { }
}
