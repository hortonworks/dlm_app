import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Ambari} from '../models/ambari';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';

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
        this.clusters.push(cluster);
        return Observable.create((observer: any) => {
           observer.next('{errorCode: 0: message: Success}');
           observer.complete();
        });
    }

    public get():Observable<Ambari[]> {
        return this.http.get(this.url , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public  getByName(name: string):Observable<Ambari> {
        return Observable.create((observer: any) => {
            observer.next(Ambari.createClusterForTest(name));
            observer.complete();
        });
    }
}
