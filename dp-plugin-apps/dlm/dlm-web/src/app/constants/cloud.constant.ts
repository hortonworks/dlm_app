/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const S3_TOKEN = 'S3_TOKEN';
export const S3 = 'S3';
export const WASB = 'WASB';
export const ADLS = 'ADLS';

export const CREDENTIAL_TYPE_VALUES = [S3_TOKEN];

export const IAM_ROLE = 'IAM_ROLE';
export const ACCESS_KEY = 'ACCESS_KEY';
export const S3_AUTH_TYPES = [ACCESS_KEY, IAM_ROLE];

export const PROVIDERS = [S3, ADLS, WASB];

export const CREDENTIAL_TYPE_LABELS = {
  [S3_TOKEN]: 'S3',
  [WASB]: 'WASB',
  [ADLS]: 'ADLS'
};

export const FILE_TYPES = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY'
};

export const ROOT_PATH = '/';
