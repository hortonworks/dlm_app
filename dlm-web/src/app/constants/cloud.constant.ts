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

export const AWS_ACCESSKEY = 'AWS_ACCESSKEY';
export const S3 = 'AWS';
export const WASB = 'WASB';
export const ADLS = 'ADLS';
export const AWS_INSTANCEPROFILE = 'AWS_INSTANCEPROFILE';
export const ADLS_STS = 'ADLS_STS';
export const WASB_ACCESSKEY = 'WASB_ACCESSKEY';
export const ACCESS_KEY = 'ACCESS_KEY';

export const PROVIDERS = [S3, ADLS, WASB];

export const CLOUD_PROVIDER_LABELS = {
  [S3]: 'S3',
  [WASB]: 'WASB',
  [ADLS]: 'ADLS'
};

export const CLOUD_PROVIDER_VALUES = [S3, ADLS, WASB];

export const CREDENTIAL_TYPE_LABELS = {
  [AWS_ACCESSKEY]: 'Access & Secret Key',
  [AWS_INSTANCEPROFILE]: 'IAM Role'
};

export const S3_TYPE_VALUES = [AWS_ACCESSKEY, AWS_INSTANCEPROFILE];

export const CLOUD_PROVIDERS = {
  S3,
  ADLS,
  WASB
};

export const CREDENTIAL_TYPES = {
  S3: {
    AWS_ACCESSKEY,
    AWS_INSTANCEPROFILE
  },
  ADLS: {
    ADLS_STS
  },
  WASB: {
    WASB_ACCESSKEY
  }
};

export const FILE_TYPES = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY'
};

export const INVALID = 'INVALID';
export const OUT_OF_SYNC = 'OUT_OF_SYNC';

export const CREDENTIAL_ERROR_TYPES = {INVALID, OUT_OF_SYNC};

export const ROOT_PATH = '/';
