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

import { FmtTzPipe } from './fmt-tz.pipe';
import { ReflectiveInjector, ChangeDetectorRef } from '@angular/core';
import { MockChangeDetectorRef } from 'mocks/mock-change-detector-ref';
import { MockTimeZoneService } from 'mocks/mock-timezone';
import { TimeZoneService } from 'services/time-zone.service';

describe('FmtTzPipe', () => {

  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ChangeDetectorRef, useClass: MockChangeDetectorRef},
      {provide: TimeZoneService, useClass: MockTimeZoneService}
    ]);

    this.changeDetectorRef = this.injector.get(ChangeDetectorRef);
    this.timeZoneService = this.injector.get(TimeZoneService);
    this.pipe = new FmtTzPipe(this.changeDetectorRef, this.timeZoneService);
  });


  describe('#Subscription', () => {

    beforeEach(() => {
      spyOn(this.changeDetectorRef, 'markForCheck');
    });

    it('should call `markForCheck`', () => {
      this.timeZoneService.userTimezoneIndex$.next('another value');
      expect(this.changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should not call `markForCheck`', () => {
      this.timeZoneService.userTimezoneIndex$.next('');
      expect(this.changeDetectorRef.markForCheck).not.toHaveBeenCalled();
    });

  });

  describe('#transform', () => {

    beforeEach(() => {
      this.timestamp = 100500;
      this.format = '';
      this.pipe.transform(this.timestamp, this.format);
      spyOn(this.timeZoneService, 'formatDateTimeWithTimeZone');
    });

    it('should recalculate', () => {
      this.pipe.transform(1, '');
      expect(this.timeZoneService.formatDateTimeWithTimeZone).toHaveBeenCalledWith(1, '');
    });

    it('should not recalculate', () => {
      this.pipe.transform(this.timestamp, this.format);
      expect(this.timeZoneService.formatDateTimeWithTimeZone).not.toHaveBeenCalled();
    });

  });

});
