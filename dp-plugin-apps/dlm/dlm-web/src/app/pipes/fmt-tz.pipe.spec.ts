/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
