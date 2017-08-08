/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TimeZoneService } from 'services/time-zone.service';
import { Subscription } from 'rxjs/Subscription';

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
  private timestamp: number;
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

  transform(timestamp: number = 0, format: string = ''): string {
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
