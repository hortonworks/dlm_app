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
import { Pairing } from '../models/pairing.model';

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

// "policyId": "/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002"
export const parsePolicyId = (policyId: string): ParsedPolicyId => {
  if (!policyId) {
    return null;
  }
  const splits = policyId.split('/');
  if (splits.length <= 5) {
    return null;
  }
  const policyName = splits[5] || '';
  const timeStamp = parseInt(splits[7], 10);
  const idSplits = (splits[9] || '').split('@');
  const dataCenter = splits[3];
  const clusterName = splits[4];
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

const clusterToListOption = cluster => {
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
