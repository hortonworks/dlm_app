import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {DataCenter} from '../models/data-center';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';

@Injectable()
export class DataCenterService {
    url = '/api/datacenters';

    private dataCenters: DataCenter[] = [];

    constructor(private http:Http) {
        this.dataCenters = DataCenter.getData();
    }

    public put(dataCenter: DataCenter):Observable<any> {
        return this.http.put(this.url, dataCenter, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public post(dataCenter: DataCenter):Observable<any> {
        this.dataCenters.push(dataCenter);
        return Observable.create((observer: any) => {
            observer.next('{errorCode: 0: message: Success}');
            observer.complete();
        });
    }

    public get():Observable<DataCenter[]> {
        return this.http.get(this.url , new RequestOptions(HttpUtil.getHeaders()))
                .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getByName(name: string):Observable<DataCenter> {
        return Observable.create((observer: any) => {
            observer.next(DataCenter.getDataByName(name));
            observer.complete();
        });
    }
}
