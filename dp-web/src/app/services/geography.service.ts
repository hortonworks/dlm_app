import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Observable} from 'rxjs/Observable';
import * as L from 'leaflet';
import {GeoJsonObject, } from 'geojson';

@Injectable()
export class GeographyService {
    urlCountries = '/assets/geojson/custom.geo.json';

    constructor(private http:Http) {}

    public getCountries(): Observable<GeoJsonObject> {
        return this.http
            .get(this.urlCountries , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

   
}
