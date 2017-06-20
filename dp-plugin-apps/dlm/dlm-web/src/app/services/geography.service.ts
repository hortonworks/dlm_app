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
