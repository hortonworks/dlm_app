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

import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { ApiInterceptor } from 'interceptors/api.interceptor';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { reducers } from 'reducers';
import { MockTimeZoneService } from 'mocks/mock-timezone';
import { TimeZoneService } from 'services/time-zone.service';

export const testHttpDef: TestModuleMetadata = {
  imports: [
    HttpClientTestingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ]
};

export const testStoreDef: TestModuleMetadata = {
  imports: [
    StoreModule.forRoot(reducers, {
      initialState: {}
    })
  ]
};

export const testTranslateDef: TestModuleMetadata = {
  imports: [
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
    })
  ]
};

export const testTimezoneDef: TestModuleMetadata = {
  providers: [
    { provide: TimeZoneService, useClass: MockTimeZoneService }
  ]
};

export const mergeDefs = (...defs: TestModuleMetadata[]): TestModuleMetadata => {
  const concatWithDefault = (sourceA = [], sourceB = []) => ([...sourceA, ...sourceB]);
  return defs.reduce((all, def: TestModuleMetadata) => {
    const { imports, providers, declarations } = def;
    return {
      ...all,
      imports: concatWithDefault(all.imports, def.imports),
      providers: concatWithDefault(all.providers, def.providers),
      declarations: concatWithDefault(all.declarations, def.declarations)
    } as TestModuleMetadata;
  }, {});
};

export const configureServiceTest = (moduleDef: TestModuleMetadata = {}): typeof TestBed => {
  return TestBed.configureTestingModule(mergeDefs(
    testHttpDef,
    testTranslateDef,
    moduleDef));
};

export const configureComponentTest = (moduleDef: TestModuleMetadata = {}): typeof TestBed => {
  return TestBed.configureTestingModule(mergeDefs(
    testHttpDef,
    testStoreDef,
    testTranslateDef,
    testTimezoneDef,
    moduleDef
  ));
};
