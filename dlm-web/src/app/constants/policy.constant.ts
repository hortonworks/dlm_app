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


// Policy Execution types
import { StepName } from 'models/wizard.model';

export const HDFS = 'FS';
export const HIVE = 'HIVE';
export const HBASE = 'HBASE';
export const HDFS_SNAPSHOT = 'FS_SNAPSHOT';
export const HDFS_CLOUD = 'FS_HCFS';
export const HDFS_CLOUD_SNAPSHOT = 'FS_HCFS_SNAPSHOT';

export const EVERY = 'EVERY';
export const NEVER = 'NEVER';

export const MINUTES = 'MINUTES';
export const HOURS = 'HOURS';
export const DAYS = 'DAYS';
export const WEEKS = 'WEEKS';

export const START_NOW = 'START_NOW';
export const ON_SCHEDULE = 'ON_SCHEDULE';

export const MONDAY = '1';
export const TUESDAY = '2';
export const WEDNESDAY = '3';
export const THURSDAY = '4';
export const FRIDAY = '5';
export const SATURDAY = '6';
export const SUNDAY = '0';

// Source and Destination Types
export const CLUSTER = 'CLUSTER';
export const S3 = 'AWS';

// Wizard step ids for Create Policy Wizard
export const GENERAL: StepName = 'general';
export const SOURCE: StepName = 'source';
export const DESTINATION: StepName = 'destination';
export const SCHEDULE: StepName = 'schedule';
export const ADVANCED: StepName = 'advanced';

// Wizard states
export const ACTIVE = 'active';
export const DISABLED = 'disabled';
export const COMPLETED = 'completed';

export enum POLICY_TYPES {
  HDFS = 'FS',
  HIVE = 'HIVE',
  HBASE = 'HBASE'
}

export const POLICY_EXECUTION_TYPES = {
  HDFS,
  HDFS_SNAPSHOT,
  HDFS_CLOUD,
  HDFS_CLOUD_SNAPSHOT,
  HIVE
};

export const POLICY_DAYS = {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY
};

export const POLICY_REPEAT_MODES = {
  EVERY
};

export const POLICY_TIME_UNITS = {
  MINUTES,
  HOURS,
  DAYS,
  WEEKS
};

export enum SOURCE_TYPES {
  CLUSTER = 'CLUSTER',
  S3 = 'AWS',
  WASB = 'WASB'
}

export const SOURCE_TYPES_LABELS = {
  [SOURCE_TYPES.CLUSTER]: 'CLUSTER',
  [SOURCE_TYPES.S3]: 'S3',
  [SOURCE_TYPES.WASB]: 'WASB'
};

export const POLICY_TYPES_LABELS = {
  [HDFS]: 'HDFS',
  [HIVE]: 'Hive',
  [HBASE]: 'HBase'
};

export const POLICY_REPEAT_MODES_LABELS = {
  [EVERY]: 'Every',
  [NEVER]: 'Never'
};

export const POLICY_DAYS_LABELS = {
  [MONDAY]: 'Monday',
  [TUESDAY]: 'Tuesday',
  [WEDNESDAY]: 'Wednesday',
  [THURSDAY]: 'Thursday',
  [FRIDAY]: 'Friday',
  [SATURDAY]: 'Saturday',
  [SUNDAY]: 'Sunday'
};

export enum POLICY_MODES {
  READ_ONLY,
  READ_WRITE
}

export const POLICY_START = {
  START_NOW,
  ON_SCHEDULE
};

export const WIZARD_STEP_ID = {
  GENERAL,
  SOURCE,
  DESTINATION,
  SCHEDULE,
  ADVANCED
};

export const WIZARD_STEP_LABELS = {
  [GENERAL]: 'General',
  [SOURCE]: 'Select Source',
  [DESTINATION]: 'Select Destination',
  [SCHEDULE]: 'Schedule',
  [ADVANCED]: 'Advanced Settings'
};

export const WIZARD_STATE = {
  ACTIVE,
  DISABLED,
  COMPLETED
};

export enum TDE_KEY_TYPE {
  SAME_KEY = 'SAME',
  DIFFERENT_KEY = 'DIFFERENT'
}

export enum TDE_KEY_LABEL {
  SAME_KEY = 'common.tde.options.same',
  DIFFERENT_KEY = 'common.tde.options.different'
}

export enum AWS_ENCRYPTION {
  SSE_S3 = 'AWS_SSES3',
  SSE_KMS = 'AWS_SSEKMS'
}

export const AWS_ENCRYPTION_LABELS = {
  [AWS_ENCRYPTION.SSE_S3]: 'SSE-S3',
  [AWS_ENCRYPTION.SSE_KMS]: 'SSE-KMS'
};

export const AWS_CLUSTER_ENCRYPTION = {
  'AES256': AWS_ENCRYPTION.SSE_S3,
  'SSE-KMS': AWS_ENCRYPTION.SSE_KMS
};

