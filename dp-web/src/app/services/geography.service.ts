/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Observable} from 'rxjs/Observable';
import * as L from 'leaflet';
import {GeoJsonObject, } from 'geojson';

@Injectable()
export class GeographyService {
    urlCountries = 'assets/geojson/geo-no-antarctica.json';

    constructor(private http:Http) {}

    public getCountries(): Observable<GeoJsonObject> {
        return this.http
            .get(this.urlCountries , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }


}
