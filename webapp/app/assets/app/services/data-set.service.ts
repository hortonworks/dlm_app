import {Injectable} from '@angular/core';
import {DataSet} from '../models/data-set';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DataSetService {

    getAll(): Observable<DataSet[]> {
        return Observable.create(observer => {
            observer.next(DataSet.getAll());
            observer.complete();
        });
    }

    getByName(name: string): Observable<DataSet> {
        return Observable.create(observer => {
            for (let dataSet of DataSet.getAll()) {
                if (dataSet.name === name) {
                    observer.next(dataSet);
                    observer.complete();
                    break;
                }
            }
        });
    }
}
