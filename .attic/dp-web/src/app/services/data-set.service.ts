import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataSet} from '../models/data-set';


@Injectable()
export class DataSetService {
    url = '/api/datasets';

    constructor(private http:Http) {}

    public post(dataSet: DataSet):Observable<any> {
        return this.http.post(this.url, dataSet, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getAll(host: string, datacenter: string):Observable<DataSet[]> {
        return this.http.get(this.url + '?host=' + host + '&datacenter=' + datacenter , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getByName(name: string, host: string, datacenter: string): Observable<DataSet> {
        return this.http.get(this.url + '/' + name + '?host=' + host + '&datacenter=' + datacenter , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}
