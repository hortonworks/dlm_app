/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UserService } from 'services/user.service';
import { AuthUtils } from 'utils/auth-utils';

@Injectable()
export class AppConfig {
  // prodMode = true;
  prodMode = false;

  constructor(
    private t: TranslateService
  ) { }

  load(userService: UserService) {
    this.setupMoment();
    this.setupTranslate();
    this.setUser(userService);
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

  setUser(userService: UserService) {
    userService.getUserDetail().subscribe(user => AuthUtils.setUser(user));
  }

  setupTranslate() {
    this.t.setTranslation('en', require('../assets/i18n/en.json'));
    this.t.setDefaultLang('en');
    this.t.use('en');
  }
}

export function appConfigFactory(config: AppConfig, userService: UserService) {
  return () => config.load(userService);
}
