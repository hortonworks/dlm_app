/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { SOURCE_TYPES, POLICY_TYPES, TDE_KEY_TYPE, AWS_ENCRYPTION } from 'constants/policy.constant';

export interface StepGeneralValue {
  name: string;
  description: string;
  type: POLICY_TYPES;
}

export interface SourceValue {
  type: SOURCE_TYPES;
  cluster: number;
  cloudAccount: string;
  s3endpoint: string;
  databases: string;
  directories: string;
  datasetEncrypted: boolean;
  cloudEncryption: AWS_ENCRYPTION;
  cloudEncryptionKey: string;
}

export interface StepSourceValue {
  source: SourceValue;
}

export interface DestinationValue {
  type: SOURCE_TYPES;
  cluster: number;
  cloudAccount: string;
  s3endpoint: string;
  path: string;
  tdeKey: TDE_KEY_TYPE;
  cloudEncryption: AWS_ENCRYPTION;
  cloudEncryptionKey: string;
}

export interface StepDestinationValue {
  destination: DestinationValue;
}

export interface ScheduleTime {
  date: Date;
  time: Date;
}

export interface ScheduleValue {
  start: string;
  repeatMode: string;
  frequency: number;
  frequencyInSec: number;
  day: string;
  unit: string;
  endTime: ScheduleTime;
  startTime: ScheduleTime;
}

export interface StepScheduleValue {
  job: ScheduleValue;
  userTimezone: string;
}

export interface AdvancedValue {
  queue_name: string;
  max_bandwidth: number;
}

export interface StepAdvancedValue {
  advanced: AdvancedValue;
}
