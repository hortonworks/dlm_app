/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const AWS = 'S3';
export const WASB = 'WASB';
export const ADLS = 'ADLS';

export const PROVIDERS = [AWS, ADLS, WASB];

export const FILE_TYPES = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY'
};

export const ROOT_PATH = '/';
