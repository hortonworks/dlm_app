import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Lineage} from '../models/lineage';
import {TypeDefs} from '../models/type-defs';

@Injectable()
export class AtlasService {

  constructor() { }

  getLineage(guid: string): Observable<any> {
    return Observable.create(observer => {
      observer.next(Lineage.getData());
      observer.complete();
    });
  }

  getEntityTypeDefs(): Observable<TypeDefs> {
    return Observable.create(observer => {
      observer.next(TypeDefs.getData());
      observer.complete();
    });
  }

}
