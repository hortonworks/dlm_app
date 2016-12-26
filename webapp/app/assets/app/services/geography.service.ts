import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class GeographyService {
    urlCountries = '/assets/geojson/countries.geo.json';
    urlCities = '/assets/geojson/cities.geo.json';

    constructor(private http:Http) {}

    public getCountries(): Observable<any> {
        return this.http
            .get(this.urlCountries , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
    public getCities(): Observable<any> {
        return this.http
            .get(this.urlCities , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}
