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

import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { groupByKey } from 'utils/array-util';
import { FormattedTimezone, ShownTimeZone, TimezonesMap } from './time-zone.type';
import { BehaviorSubject } from 'rxjs';
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

  public getTimezoneByIndex(timezoneIndex): ShownTimeZone {
    return this.mappedByValueTimezones[timezoneIndex] || null;
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
  public formatDateTimeWithTimeZone(timestamp: number|string, format: string, serverTimezone?: string): string {
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
        groupByKey: z.utcOffset(jan) + '' + z.utcOffset(jul),
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
    const tz = this.getTimezoneByIndex(timezoneIndex);
    return tz && 'zones' in tz && tz.zones.length ? tz.zones[0].value : this.defaultServerTimezone;
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
