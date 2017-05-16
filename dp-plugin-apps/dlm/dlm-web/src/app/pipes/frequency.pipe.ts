import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
import { TranslateService } from '@ngx-translate/core';

const {isInteger} = Number;

@Pipe({name: 'frequency'})
export class FrequencyPipe implements PipeTransform {

  private _fmt(num, type) {
    const tKey = `common.frequency.${type}.` + (num === 1 ? 'singular' : 'plural');
    return this.t.instant(tKey, {num});
  }

  constructor(private t: TranslateService) {
  }

  transform(frequency: number): string {
    const duration = moment.duration(frequency * 1000);
    const seconds = duration.asSeconds();
    const minutes = duration.asMinutes();
    const hours = duration.asHours();
    const days = duration.asDays();
    const weeks = duration.asWeeks();
    const months = duration.asMonths();
    const years = duration.asYears();
    if (isInteger(years)) {
      return this._fmt(years, 'yearly');
    }
    if (isInteger(months)) {
      return this._fmt(months, 'monthly');
    }
    if (isInteger(weeks)) {
      return this._fmt(weeks, 'weekly');
    }
    if (isInteger(days)) {
      return this._fmt(days, 'daily');
    }
    if (isInteger(hours)) {
      return this._fmt(hours, 'hourly');
    }
    if (isInteger(minutes)) {
      return this._fmt(minutes, 'minutely');
    }
    if (isInteger(seconds)) {
      return this._fmt(seconds, 'secondly');
    }
  }
}
