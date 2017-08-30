/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import * as moment from 'moment';

export class DateUtils {

  public static toReadableDate(since: number) {
    if (!since || since === 0) {
      return 'NA';
    }
    return moment.duration(since).humanize();
  }

  public static formatDate(timeInMillisecs, format) {
    return moment(timeInMillisecs).format(format);
  }

  public static compare(first, second) {
    let currentTime = moment.now();
    return moment(currentTime + first).isBefore(currentTime + second);
  }

}
