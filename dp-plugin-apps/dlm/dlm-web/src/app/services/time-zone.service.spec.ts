import { TestBed } from '@angular/core/testing';
import { ReflectiveInjector } from '@angular/core';
import { SessionStorageService } from 'services/session-storage.service';
import { TimeZoneService } from './time-zone.service';

describe('TimeZoneService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeZoneService, SessionStorageService]
    });
    this.injector = ReflectiveInjector.resolveAndCreate([TimeZoneService, SessionStorageService]);
    this.timeZoneService = this.injector.get(TimeZoneService);
  });

  describe('#parsedTimezones', () => {
    it('should not be empty', () => {
      expect(this.timeZoneService.parsedTimezones.length).toBeGreaterThan(0);
    });
  });

  describe('#mappedByValueTimezones', () => {
    it('should not be empty', () => {
      expect(Object.keys(this.timeZoneService.mappedByValueTimezones).length).toBeGreaterThan(0);
    });
  });

  describe('#dateTimeWithTimeZone', () => {

    it('should return timestamp for user timezone', () => {
      this.timeZoneService.userTimezoneIndex = '-120-180|Europe';
      const time = new Date().getTime();
      const expectedTime = time + 2 * 3600 * 1000;
      expect(this.timeZoneService.dateTimeWithTimeZone(time)).toBeLessThanOrEqual(expectedTime);
    });

    it('should return timestamp if user timezone is not provided', () => {
      this.timeZoneService.userTimezoneIndex = '';
      const time = new Date().getTime();
      expect(this.timeZoneService.dateTimeWithTimeZone(time)).toBe(time);
    });

  });

});
