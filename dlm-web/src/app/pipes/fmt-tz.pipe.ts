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

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TimeZoneService } from 'services/time-zone.service';
import { Subscription } from 'rxjs';

/**
 * Convert timestamp to the user-friendly date-string
 * Supports any moment.js format
 * Updated if user has changed its timezone
 *
 * Usage:
 * <pre>
 *   {{timestamp | fmtTz:"momentjs-format-string"}}
 * </pre>
 */
@Pipe({name: 'fmtTz', pure: false})
export class FmtTzPipe implements PipeTransform, OnDestroy {

  /**
   * Saved `timestamp` input
   */
  private timestamp: number|string;
  /**
   * Saved `format` input
   */
  private format: string;
  /**
   * Previous timezone index
   */
  private lastTz = '';
  /**
   * Current timezone index
   */
  private currentTz = '';
  /**
   * Saved result for `transform`
   */
  private lastText = '';
  /**
   * Subscribe to the TimeZoneService userTimeZoneIndex
   * Force pipe updating if its value is changed
   */
  private timeZoneIndexSubscription: Subscription;

  constructor(private cdRef: ChangeDetectorRef, private timeZoneService: TimeZoneService) {
    this.timeZoneIndexSubscription = this.timeZoneService.userTimezoneIndex$.subscribe(tz => {
      this.currentTz = tz;
      if (this.lastTz !== tz) {
        this.cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.timeZoneIndexSubscription.unsubscribe();
  }

  transform(timestamp: number|string, format: string = ''): string {
    if (this.hasChanges(timestamp, format)) {
      this.timestamp = timestamp;
      this.format = format;
      this.lastTz = this.currentTz;
      this.lastText = this.timeZoneService.formatDateTimeWithTimeZone(this.timestamp, this.format);
    }
    return this.lastText;
  }

  /**
   * Pipe should be recalculated on timestamp, format or timezone change
   * @returns {boolean}
   */
  private hasChanges(timestamp, format) {
    return this.timestamp !== timestamp || this.format !== format || this.lastTz !== this.currentTz;
  }
}
