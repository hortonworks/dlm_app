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

import { FrequencyPipe } from './frequency.pipe';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateTestingModule } from 'testing/translate-testing.module';

describe('FrequencyPipe', () => {
  let translateService, pipe;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateTestingModule],
      declarations: [FrequencyPipe]
    });
    translateService = getTestBed().get(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    pipe = new FrequencyPipe(translateService);
  }));

  describe('#transform', () => {
    [
      {input: 60, name: 'Every minute', output: 'common.frequency.minutely.singular'},
      {input: 60 * 2, name: 'Every 2m', output: 'common.frequency.minutely.plural.short'},
      {input: 3600, name: 'Every hour', output: 'common.frequency.hourly.singular'},
      {input: 3600 * 2, name: 'Every 2h', output: 'common.frequency.hourly.plural.short'},
      {input: 3600 * 24, name: 'Every day', output: 'common.frequency.daily.singular'},
      {input: 3600 * 24 * 2, name: 'Every 2d', output: 'common.frequency.daily.plural.short'},
      {input: 3600 * 24 * 7, name: 'Every week', output: 'common.frequency.weekly.singular'},
      {input: 3600 * 24 * 7 * 2, name: 'Every 2w', output: 'common.frequency.weekly.plural.short'}
    ].forEach(test => {
      it(`${test.input} -> ${test.name}`, () => {
        expect(pipe.transform(test.input)).toBe(test.output);
      });
    });
  });

});
