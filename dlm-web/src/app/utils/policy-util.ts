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

import { Policy } from 'models/policy.model';
import { POLICY_UI_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { Pairing } from 'models/pairing.model';
import { Cluster } from 'models/cluster.model';
import { Step } from 'models/wizard.model';
import { CLUSTER_STATUS, SERVICE_STATUS } from '../constants/status.constant';
import { SERVICES } from '../constants/cluster.constant';
import { flatten } from './array-util';
import { TranslateService } from '@ngx-translate/core';
import { AuthUtils } from './auth-utils';

export const isEnded = (policy: Policy) => policy.uiStatus === POLICY_UI_STATUS.ENDED;
export const activateDisabled = (policy: Policy) => policy.status === POLICY_STATUS.RUNNING || isEnded(policy);
export const suspendDisabled = (policy: Policy) => policy.status === POLICY_STATUS.SUSPENDED || isEnded(policy);

export interface ParsedPolicyId {
  policyName: string;
  timeStamp: number;
  policyBeaconId: string;
  jobId: string;
  clusterName: string;
  dataCenter: string;
  policyId: string;
}

export interface ClusterListOptionLabel {
  display: string;
  isUnhealthy: boolean;
  lacksPrivilege: boolean;
}

export interface ClusterListOption {
  label: ClusterListOptionLabel;
  value: number;
}

export const getStepById = (steps: Step[], stepId: string): Step => {
  let step = null;
  const filtered = steps.filter(_step => _step.id === stepId);
  if (filtered && filtered.length) {
    step = filtered[0];
  }
  return step;
};

// "policyId": "/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002"
export const parsePolicyId = (policyId: string): ParsedPolicyId => {
  if (!policyId) {
    return null;
  }
  const splits = policyId.split('/').slice(1, policyId.split('/').length);
  if (splits.length <= 4) {
    return null;
  }
  // cluster to cluster and cluster to cloud events has 8 splits
  // cloud to cluster event has 6 splits (without target cluster splits)
  const offset = splits.length === 6 ? 2 : 0;
  const withOffset = (id) => id - offset;
  const policyName = splits[withOffset(4)] || '';
  const timeStamp = parseInt(splits[withOffset(6)], 10);
  const idSplits = (splits[withOffset(7)] || '').split('@');
  const dataCenter = splits[withOffset(2)];
  const clusterName = splits[withOffset(3)];
  const policyBeaconId = idSplits.length ? idSplits[0] : null;
  // jobId segment may not be present, it can be absent when we look to policy log
  // and will be there in case when we look to job log
  const jobId = idSplits.length ? idSplits[0] || null : null;
  return {
    policyId: policyId.replace(/@.+$/, ''),
    policyName,
    timeStamp,
    policyBeaconId,
    jobId,
    clusterName,
    dataCenter
  };
};

export const clusterToListOption = (cluster: Cluster): ClusterListOption => {
  const beaconStatus = (cluster.status && cluster.status.filter(status => status.service_name === SERVICES.BEACON)) || [];
  const isBeaconUnhealthy = (beaconStatus.length > 0) ? beaconStatus[0].state !== SERVICE_STATUS.STARTED : false;
  const isAmbariUnhealthy = cluster.healthStatus === CLUSTER_STATUS.UNKNOWN;
  const lacksPrivilege = cluster.privilege && cluster.privilege.isConfigReadAuthEnabled === false;
  return {
    label: {
      display: `${cluster.name} (${cluster.dataCenter})`,
      isUnhealthy: isBeaconUnhealthy || isAmbariUnhealthy,
      lacksPrivilege
    },
    value: cluster.id
  };
};

export const sortClusterListOptions = (clusterList: ClusterListOption[]): ClusterListOption[] => {
  const disabledClusters = clusterList.filter(clusterOption => clusterOption.label.isUnhealthy === true ||
    clusterOption.label.lacksPrivilege === true);
  const activeClusters = clusterList.filter(clusterOption => clusterOption.label.isUnhealthy === false &&
    clusterOption.label.lacksPrivilege === false);
  return flatten([activeClusters, disabledClusters]);
};

export const getClusterEntities = (pairings, clusters: Cluster[]) => {
  return pairings.reduce((entities: { [id: number]: {} }, entity: Pairing) => {
    const getClusters = pairing => {
      return pairing.pair.reduce((clusterEntities: {}, cluster) => {
        return Object.assign({}, clusterEntities, {
          [cluster.id]: clusterToListOption(clusters.find(c => c.id === cluster.id))
        });
      }, {});
    };
    return Object.assign({}, entities, getClusters(entity));
  }, {});
};

export const isStepIdBefore = (steps: Step[], stepIdOne: string, stepIdTwo: string): boolean => {
  const stepOne = getStepById(steps, stepIdOne);
  const stepTwo = getStepById(steps, stepIdTwo);
  return stepOne.index < stepTwo.index;
};

export const addCloudPrefix = (s3endpoint: string): string => {
  return s3endpoint.startsWith('s3://') ? s3endpoint : `s3://${s3endpoint}`;
};

export const isOptionDisabled = (option: ClusterListOption): boolean => {
  return option.label.isUnhealthy || option.label.lacksPrivilege;
};

export const dropdownClickHandler = (option: ClusterListOption, dropdownActionEmitter) => {
  const isDisabled = isOptionDisabled(option);
  if (!isDisabled) {
    dropdownActionEmitter.emit(option.value);
  }
};

export const getTooltip = (translateService: TranslateService, option: ClusterListOption) => {
  let tooltip = '';
  const isDisabled = isOptionDisabled(option);
  if (isDisabled) {
    if (option.label.isUnhealthy) {
      tooltip = translateService.instant('page.pairings.create.content.unhealthy_clusters_hint');
    } else if (option.label.lacksPrivilege) {
      tooltip = translateService.instant('page.pairings.create.content.lack_privilege_hint', {username: AuthUtils.getUser().display});
    }
  }
  return tooltip;
};
