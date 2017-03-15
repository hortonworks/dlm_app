import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import {Ambari} from '../models/ambari';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class AmbariService {
    url = '/api/clusters';
    private cluster: Ambari;
    private clusters: Ambari[] = [];

    constructor(private http:Http) {}

    public put(cluster: Ambari):Observable<any> {
        return this.http.put(this.url, cluster, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public post(cluster: Ambari):Observable<any> {
        return this.http.post(this.url, cluster, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public get():Observable<Ambari[]> {
        return this.http.get(this.url , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getByName(name: string):Observable<Ambari> {
        return Observable.create((observer: any) => {
            observer.next(Ambari.createClusterForTest(name));
            observer.complete();
        });
    }

    public getById(id: string): Observable<Ambari> {
      return this.http.get(`${this.url}/${id}` , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData)
            .catch(HttpUtil.handleError);
    }
}
