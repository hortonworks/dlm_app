/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { groupByKey } from 'utils/array-util';
import { FormattedTimezone, ShownTimeZone, TimezonesMap } from './time-zone.type';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SessionStorageService } from 'services/session-storage.service';

@Injectable()
export class TimeZoneService {

  private _parsedTimezones: ShownTimeZone[];
  private _mappedByValueTimezones: TimezonesMap;

  public userTimezoneIndex$: BehaviorSubject<string> = new BehaviorSubject('');

  defaultServerTimezone = 'Atlantic/Reykjavik';

  get parsedTimezones(): ShownTimeZone[] {
    if (!this._parsedTimezones) {
      this._parsedTimezones = this._parseTimezones();
    }
    return this._parsedTimezones;
  }

  get mappedByValueTimezones(): TimezonesMap {
    if (!this._mappedByValueTimezones) {
      this._mappedByValueTimezones = this._mapTimezones();
    }
    return this._mappedByValueTimezones;
  }

  get userTimezone(): ShownTimeZone {
    const userTimezoneIndex = this.userTimezoneIndex$.getValue();
    return userTimezoneIndex ? this.getTimezoneByIndex(userTimezoneIndex) : null;
  }

  get clientTimeZoneIndex(): string {
    const clientTz = moment.tz.guess();
    return Object.keys(this.mappedByValueTimezones).filter(id => {
      return this.mappedByValueTimezones[id].zones.some(zone => zone.value === clientTz);
    })[0];
  }

  constructor(private sessionStorageService: SessionStorageService) { }

  public getTimezoneByIndex(timezoneIndex) {
    return this.mappedByValueTimezones[timezoneIndex];
  }

  /**
   * Convert UTC-timestamp to the timezone timestamp
   * @param {number} [timestamp]
   * @returns {number}
   */
  public dateTimeWithTimeZone(timestamp?: any, serverTimezone?: string): any {
    const timezone = this.userTimezone;
    if (serverTimezone === '') {
      serverTimezone = this.defaultServerTimezone;
    }
    if (timezone) {
      const tz = timezone.zones[0].value;
      return moment(moment.tz(timestamp ? moment.tz(timestamp, serverTimezone) : new Date(), tz).toArray()).toDate().getTime();
    }
    return timestamp || new Date().getTime();
  }

  /**
   * Convert UTC-timestamp to the formatted date string for user timezone
   * @param {number} timestamp
   * @param {string} format moment.js-compatible date format
   * @returns {string}
   */
  public formatDateTimeWithTimeZone(timestamp: number, format: string, serverTimezone?: string): string {
    const time = this.dateTimeWithTimeZone(timestamp, serverTimezone);
    return moment(time).format(format);
  }

  private _mapTimezones(): TimezonesMap {
    const mapped = {};
    this.parsedTimezones.forEach(tz => mapped[tz.value] = tz);
    return mapped;
  }

  private _parseTimezones(): ShownTimeZone[] {
    const currentYear = new Date().getFullYear();
    const jan = new Date(currentYear, 0, 1).getTime();
    const jul = new Date(currentYear, 6, 1).getTime();
    const zones = this._getTimezones().map(timeZoneName => {
      const zone = moment(new Date()).tz(timeZoneName);
      const z = moment.tz.zone(timeZoneName);
      const offset = zone.format('Z');
      const regionCity = timeZoneName.split('/');
      const region = regionCity[0];
      const city = regionCity.length === 2 ? regionCity[1] : '';
      return {
        groupByKey: z.offset(jan) + '' + z.offset(jul),
        utcOffset: zone.utcOffset(),
        formattedOffset: offset,
        value: timeZoneName,
        region: region,
        city: city.replace(/_/g, ' ')
      } as FormattedTimezone;
    }).sort((zoneA, zoneB) => {
      if (zoneA.utcOffset === zoneB.utcOffset) {
        if (zoneA.value === zoneB.value) {
          return 0;
        }
        return zoneA.value < zoneB.value ? -1 : 1;
      } else {
        return zoneA.utcOffset < zoneB.utcOffset ? -1 : 1;
      }
    });

    return this._groupTimezones(zones);
  }

  private _getTimezones(): string[] {
    return moment.tz.names().filter(timeZoneName => {
      return timeZoneName.indexOf('Etc/') !== 0 && timeZoneName !== timeZoneName.toUpperCase();
    });
  }

  private _groupTimezones(zones: FormattedTimezone[]) {
    const z = groupByKey(zones, 'groupByKey');
    const newZones = [];
    Object.keys(z).forEach(offset => {
      const groupedByRegionZones = groupByKey(z[offset], 'region');
      Object.keys(groupedByRegionZones).forEach(region => {
        const cities = groupedByRegionZones[region].map(i => i.city).filter(city => {
          return city !== '' && city !== city.toUpperCase();
        }).filter((item, index, collection) => collection.indexOf(item) === index).join(', ');
        const formattedOffset = groupedByRegionZones[region][0].formattedOffset;
        const utcOffset = groupedByRegionZones[region][0].utcOffset;
        const value = groupedByRegionZones[region][0].groupByKey + '|' + region;
        let abbr = moment.tz(groupedByRegionZones[region][0].value).format('z');
        abbr = abbr.toLowerCase() !== abbr ? abbr : '';
        newZones.push({
          utcOffset,
          label: '(UTC' + formattedOffset + ' ' + abbr + ') ' + region + (cities ? ' / ' + cities : ''),
          value,
          zones: groupedByRegionZones[region]
        });
      });
    });
    return newZones.sort((a, b) => a.utcOffset < b.utcOffset ? -1 : 1);
  }

  getMomentTzByIndex(timezoneIndex: string): string {
    return this.getTimezoneByIndex(timezoneIndex).zones[0].value;
  }

  setTimezone(timezoneIndex: string) {
    const zoneIndex = timezoneIndex || this.clientTimeZoneIndex;
    moment.tz.setDefault(this.getMomentTzByIndex(zoneIndex));
    this.userTimezoneIndex$.next(zoneIndex);
  }

  setupUserTimeZone(): string {
    // Provide selected by user timezone to the TimezoneService instance
    // It allows to convert dates using this timezone
    // @see Pipe `fmt-tz`
    const tz = this.sessionStorageService.get('tz');
    this.setTimezone(tz);
    return this.userTimezoneIndex$.getValue();
  }
}
