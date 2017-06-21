import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Injectable()
export class AppConfig {
  constructor(
    private t: TranslateService
  ) { }

  load() {
    this.setupMoment();
    this.setupTranslate();
    return Promise.resolve();
  }

  setupMoment() {
    moment.locale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s:  'seconds',
        ss: '%ss',
        m:  'a minute',
        mm: '%dm',
        h:  'an hour',
        hh: '%dh',
        d:  'a day',
        dd: '%dd',
        M:  'a month',
        MM: '%dM',
        y:  'a year',
        yy: '%dY'
      }
    });
  }

  setupTranslate() {
    this.t.setTranslation('en', require('../assets/i18n/en.json'));
    this.t.setDefaultLang('en');
    this.t.use('en');
  }
}

export function appConfigFactory(config: AppConfig) {
  return () => config.load();
};
