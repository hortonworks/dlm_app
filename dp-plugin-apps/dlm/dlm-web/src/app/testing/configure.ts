/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
