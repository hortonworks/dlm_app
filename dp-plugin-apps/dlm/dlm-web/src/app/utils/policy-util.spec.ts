/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as policyUtil from './policy-util';
import { ParsedPolicyId } from './policy-util';

describe('Policy Util', () => {
  describe('#parsePolicyId', () => {
    it('should return null if policyId is not defined', () => {
      expect(policyUtil.parsePolicyId('')).toBeNull('empty string');
      expect(policyUtil.parsePolicyId(undefined)).toBeNull('undefined');
      expect(policyUtil.parsePolicyId(null)).toBeNull('null');
    });

    it('should return null if policyId has not enough info', () => {
      const id = '/sdc/s/tdc/t';
      expect(policyUtil.parsePolicyId(id)).toBeNull();
    });

    it('should return at least policy name, cluster name and datacenter', () => {
      const id = '/sdc/s/tdc/t/policy';
      expect(policyUtil.parsePolicyId(id)).toEqual({
        policyName: 'policy',
        timeStamp: NaN,
        policyBeaconId: '',
        jobId: null,
        clusterName: 't',
        dataCenter: 'tdc'
      } as ParsedPolicyId);
    });

    it('should return full info', () => {
      const id = '/sdc/s/tdc/t/policy/0/1494924228843/000000002@j';
      expect(policyUtil.parsePolicyId(id)).toEqual({
        policyName: 'policy',
        timeStamp: 1494924228843,
        policyBeaconId: '000000002',
        jobId: '000000002',
        clusterName: 't',
        dataCenter: 'tdc'
      } as ParsedPolicyId);
    });

    it('should return correct info when event related to cloud to cluster policy event', () => {
      const id = '/default/c7/d-test/0/1520998730698/000000001@1';
      expect(policyUtil.parsePolicyId(id)).toEqual({
        policyName: 'd-test',
        timeStamp: 1520998730698,
        policyBeaconId: '000000001',
        clusterName: 'c7',
        dataCenter: 'default',
        jobId: '000000001',
      } as ParsedPolicyId);
    });
  });
});
