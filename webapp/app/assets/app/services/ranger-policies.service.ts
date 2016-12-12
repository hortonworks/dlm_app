import {Injectable} from '@angular/core';
import {RangerPolicies} from '../models/ranger-policies';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RangerPoliciesService {

    get(): Observable<RangerPolicies[]> {
        return Observable.create(observable => {
            observable.next(RangerPolicies.getData());
            observable.complete();
        });
    }
}