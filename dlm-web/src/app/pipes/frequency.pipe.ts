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

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
import { TranslateService } from '@ngx-translate/core';

const {isInteger} = Number;
export const SHORT = 'short';
export const DETAILED = 'detailed';

@Pipe({name: 'frequency'})
export class FrequencyPipe implements PipeTransform {

  private _fmt(num, type, expression) {
    const noun = num === 1 ? 'singular' : 'plural';
    const tKey = noun === 'singular' ? `common.frequency.${type}.${noun}` : `common.frequency.${type}.${noun}.${expression}`;
    return this.t.instant(tKey, {num});
  }

  constructor(private t: TranslateService) {
  }

  transform(frequency: number, expression = SHORT): string {
    const duration = moment.duration(frequency * 1000);
    const seconds = duration.asSeconds();
    const minutes = duration.asMinutes();
    const hours = duration.asHours();
    const days = duration.asDays();
    const weeks = duration.asWeeks();
    const months = duration.asMonths();
    const years = duration.asYears();
    if (isInteger(years)) {
      return this._fmt(years, 'yearly', expression);
    }
    if (isInteger(months)) {
      return this._fmt(months, 'monthly', expression);
    }
    if (isInteger(weeks)) {
      return this._fmt(weeks, 'weekly', expression);
    }
    if (isInteger(days)) {
      return this._fmt(days, 'daily', expression);
    }
    if (isInteger(hours)) {
      return this._fmt(hours, 'hourly', expression);
    }
    if (isInteger(minutes)) {
      return this._fmt(minutes, 'minutely', expression);
    }
    if (isInteger(seconds)) {
      return this._fmt(seconds, 'secondly', expression);
    }
  }
}
