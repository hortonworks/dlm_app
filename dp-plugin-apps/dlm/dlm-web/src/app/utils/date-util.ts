/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { IMyDate } from 'mydatepicker';
import * as moment from 'moment-timezone';

export const getDatePickerDate = (date: moment.Moment): IMyDate => {
  return {
    year: date.year(),
    month: date.month() + 1,
    day: date.date()
  };
};

export const getTime = (date: string): number => (new Date(date)).getTime();
