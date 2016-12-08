import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {DataCenter} from '../models/data-center';

@Injectable()
export class DataCenterService {
    url = '/datacenter';
    defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

    private dataCenters: DataCenter[] = [];

    constructor(private http:Http) {
        this.dataCenters = DataCenter.getData();
    }

    public post(dataCenter: DataCenter):Observable<any> {
        this.dataCenters.push(dataCenter);
        return Observable.create((observer: any) => {
            observer.next('{errorCode: 0: message: Success}');
            observer.complete();
        });
    }

    public get():Observable<DataCenter[]> {
        return Observable.create((observer: any) => {
            observer.next(this.dataCenters);
            observer.complete();
        });
    }

    public getByName(name: string):Observable<DataCenter> {
        return Observable.create((observer: any) => {
            observer.next(DataCenter.getDataByName(name));
            observer.complete();
        });
    }
}
