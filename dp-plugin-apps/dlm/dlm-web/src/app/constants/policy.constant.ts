export const HDFS = 'FS';
export const HIVE = 'HIVE';
export const HBASE = 'HBASE';

export const SCHEDULE = 'SUBMIT_AND_SCHEDULE';
export const SUBMIT = 'SUBMIT';

export const EVERY = 'EVERY';
export const NEVER = 'NEVER';

export const MINUTES = 'MINUTES';
export const HOURS = 'HOURS';
export const DAYS = 'DAYS';
export const WEEKS = 'WEEKS';

export const MONDAY = 1;
export const TUESDAY = 2;
export const WEDNESDAY = 3;
export const THURSDAY = 4;
export const FRIDAY = 5;
export const SATURDAY = 6;
export const SUNDAY = 7;

export const POLICY_TYPES = {
  HDFS,
  HIVE,
  HBASE
};

export const POLICY_SUBMIT_TYPES = {
  SCHEDULE,
  SUBMIT
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
  EVERY,
  NEVER
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
