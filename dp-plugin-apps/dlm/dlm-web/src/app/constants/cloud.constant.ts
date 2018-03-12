/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const AWS_ACCESSKEY = 'AWS_ACCESSKEY';
export const S3 = 'AWS';
export const WASB = 'WASB';
export const ADLS = 'ADLS';
export const AWS_INSTANCEPROFILE = 'AWS_INSTANCEPROFILE';
export const ACCESS_KEY = 'ACCESS_KEY';

export const PROVIDERS = [S3, ADLS, WASB];

export const CLOUD_PROVIDER_LABELS = {
  [S3]: 'S3',
  [WASB]: 'WASB',
  [ADLS]: 'ADLS'
};

export const CLOUD_PROVIDER_VALUES = [S3];

export const CREDENTIAL_TYPE_LABELS = {
  [AWS_ACCESSKEY]: 'Access & Secret Key',
  [AWS_INSTANCEPROFILE]: 'IAM Role'
};

export const S3_TYPE_VALUES = [AWS_ACCESSKEY, AWS_INSTANCEPROFILE];

export const FILE_TYPES = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY'
};

export const INVALID = 'INVALID';
export const OUT_OF_SYNC = 'OUT_OF_SYNC';

export const CREDENTIAL_ERROR_TYPES = {INVALID, OUT_OF_SYNC};

export const ROOT_PATH = '/';
