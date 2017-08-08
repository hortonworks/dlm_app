/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Injectable, isDevMode} from '@angular/core';
import {Http} from '@angular/http';
import {mapResponse} from 'utils/http-util';
import {Observable} from 'rxjs/Observable';

declare const L: any;

@Injectable()
export class GeographyService {

  urlBase = isDevMode() ? '/assets/geojson/geo-no-antartica.json' : '/dlm/assets/geojson/geo-no-antartica.json';
  urlCountries = isDevMode() ? '/assets/geojson/countries.json' : '/dlm/assets/geojson/countries.json';

  constructor(private http: Http) {}

  public getBase(): Observable<any> {
    return mapResponse(this.http
      .get(this.urlBase));
  }

  public getCountries(): Observable<any> {
    return mapResponse(this.http
      .get(this.urlCountries));
  }
}
