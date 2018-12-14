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

import * as policyUtil from './policy-util';
import {ParsedPolicyId} from './policy-util';
import {SOURCE_TYPES} from '../constants/policy.constant';

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
        policyId: '/sdc/s/tdc/t/policy',
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
        policyId: '/sdc/s/tdc/t/policy/0/1494924228843/000000002',
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
        policyId: '/default/c7/d-test/0/1520998730698/000000001',
        policyName: 'd-test',
        timeStamp: 1520998730698,
        policyBeaconId: '000000001',
        clusterName: 'c7',
        dataCenter: 'default',
        jobId: '000000001',
      } as ParsedPolicyId);
    });
  });

  describe('#addCloudPrefix', () => {
    it('should add missing prefix', () => {
      expect(policyUtil.addCloudPrefix('some-path', SOURCE_TYPES.S3)).toEqual('s3://some-path');
    });

    it('should not add prefix', () => {
      expect(policyUtil.addCloudPrefix('s3://some-path',  SOURCE_TYPES.S3)).toEqual('s3://some-path');
    });
  });
});
