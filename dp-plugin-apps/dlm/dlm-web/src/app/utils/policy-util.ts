/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Policy } from 'models/policy.model';
import { POLICY_UI_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { Pairing } from 'models/pairing.model';
import { Step } from 'models/wizard.model';

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
    policyName,
    timeStamp,
    policyBeaconId,
    jobId,
    clusterName,
    dataCenter
  };
};

export const clusterToListOption = cluster => {
  return {
    label: `${cluster.name} (${cluster.dataCenter})`,
    value: cluster.id
  };
};

export const getClusterEntities = pairings => {
  return pairings.reduce((entities: { [id: number]: {} }, entity: Pairing) => {
    const getClusters = (pairing) => {
      return pairing.pair.reduce((clusters: {}, cluster) => {
        return Object.assign({}, clusters, {
          [cluster.id]: clusterToListOption(cluster)
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
