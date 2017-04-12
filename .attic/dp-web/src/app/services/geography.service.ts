import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Observable} from 'rxjs/Observable';

declare const L: any;

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

    public getMap(id: string | HTMLElement): Observable<any> {
      const map =
        new L
          .Map(id, {
            // options
            center: [0, 0],
            zoom: 1,
            // minZoom: 1,
            maxZoom: 5,
            // interaction options
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            // control options
            attributionControl: false,
            zoomControl: false
          });

      const rxMap =
        this.getCountries()
          .map(countrySet => {
            const baseLayer =
              L
                .geoJSON(countrySet, {
                  style: {
                      fillColor: '#ABE3F3',
                      fillOpacity: 1,
                      weight: 1,
                      color: '#FDFDFD'
                  }
                });

            // added pseudo layer to prevent empty space when zoomed out
            // https://github.com/Leaflet/Leaflet/blob/v1.0.2/src/layer/GeoJSON.js#L205
        const pseudoBaseLayer =
          L
            .geoJSON(countrySet, {
              style: {
                  fillColor: '#ABE3F3',
                  fillOpacity: 1,
                  weight: 1,
                  color: '#FDFDFD'
              },
              coordsToLatLng: (coords: number[]) => new L.LatLng(coords[1], coords[0] - 360, coords[2])
            });

          L
            .featureGroup([baseLayer, pseudoBaseLayer])
            .addTo(map)
            .bringToBack();

          return map;
        });

        return rxMap;
    }
}
