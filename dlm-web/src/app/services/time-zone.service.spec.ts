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

import { TestBed } from '@angular/core/testing';
import { ReflectiveInjector } from '@angular/core';
import { SessionStorageService } from 'services/session-storage.service';
import { TimeZoneService } from './time-zone.service';

describe('TimeZoneService', () => {
  let injector, timeZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeZoneService, SessionStorageService]
    });
    injector = ReflectiveInjector.resolveAndCreate([TimeZoneService, SessionStorageService]);
    timeZoneService = injector.get(TimeZoneService);
  });

  describe('#parsedTimezones', () => {
    it('should not be empty', () => {
      expect(timeZoneService.parsedTimezones.length).toBeGreaterThan(0);
    });
  });

  describe('#mappedByValueTimezones', () => {
    it('should not be empty', () => {
      expect(Object.keys(timeZoneService.mappedByValueTimezones).length).toBeGreaterThan(0);
    });
  });

  describe('#dateTimeWithTimeZone', () => {

    it('should return timestamp for user timezone', () => {
      timeZoneService.userTimezoneIndex = '-120-180|Europe';
      const time = new Date().getTime();
      const expectedTime = time + 2 * 3600 * 1000;
      expect(timeZoneService.dateTimeWithTimeZone(time)).toBeLessThanOrEqual(expectedTime);
    });

    it('should return timestamp if user timezone is not provided', () => {
      timeZoneService.userTimezoneIndex = '';
      const time = new Date().getTime();
      expect(timeZoneService.dateTimeWithTimeZone(time)).toBe(time);
    });

  });

});
