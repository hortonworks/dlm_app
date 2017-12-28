/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mapResponse } from 'utils/http-util';
import { Observable } from 'rxjs/Observable';

declare const L: any;

@Injectable()
export class GeographyService {

  urlBase = isDevMode() ? '/assets/geojson/geo-no-antartica.json' : '/dlm/assets/geojson/geo-no-antartica.json';
  urlCountries = isDevMode() ? '/assets/geojson/countries.json' : '/dlm/assets/geojson/countries.json';

  constructor(private httpClient: HttpClient) {}

  public getBase(): Observable<any> {
    return this.httpClient.get<any>(this.urlBase);
  }

  public getCountries(): Observable<any> {
    return this.httpClient.get<any>(this.urlCountries);
  }
}
