/**
 * Created by rksv on 04/12/16.
 */
import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {Schema} from '../models/schema';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HiveDataService {

    constructor(private http: Http) {}
    getSchemaData():Observable<Schema[]> {
        return Observable.create((observer: any) => {
            observer.next(Schema.getData());
            observer.complete();
        });
    }
}