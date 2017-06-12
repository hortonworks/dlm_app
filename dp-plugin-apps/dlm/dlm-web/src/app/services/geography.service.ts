import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {mapResponse} from 'utils/http-util';
import {Observable} from 'rxjs/Observable';

declare const L: any;

@Injectable()
export class GeographyService {

  urlBase = '/dlm/assets/geojson/geo-no-antartica.json';
  urlCountries = '/dlm/assets/geojson/countries.json';

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
