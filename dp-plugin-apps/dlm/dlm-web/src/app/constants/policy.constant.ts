/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const HDFS = 'FS';
export const HIVE = 'HIVE';
export const HBASE = 'HBASE';
export const HDFS_SNAPSHOT = 'FS_SNAPSHOT';

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

// Wizard step ids for Create Policy Wizard
export const GENERAL = 'general';
export const SOURCE = 'source';
export const DESTINATION = 'destination';
export const SCHEDULE = 'schedule';
export const ADVANCED = 'advanced';
export const REVIEW = 'review';

// Wizard states
export const ACTIVE = 'active';
export const DISABLED = 'disabled';
export const COMPLETED = 'completed';

export const POLICY_TYPES = {
  HDFS,
  HIVE,
  HBASE
};

export const POLICY_EXECUTION_TYPES = {
  HDFS,
  HDFS_SNAPSHOT,
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
  ADVANCED,
  REVIEW
};

export const WIZARD_STEP_LABELS = {
  [GENERAL]: 'General',
  [SOURCE]: 'Select Source',
  [DESTINATION]: 'Select Destination',
  [SCHEDULE]: 'Schedule',
  [ADVANCED]: 'Advanced Settings',
  [REVIEW]: 'Review'
};

export const WIZARD_STATE = {
  ACTIVE,
  DISABLED,
  COMPLETED
};
