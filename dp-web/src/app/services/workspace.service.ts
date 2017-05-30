import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {Workspace} from '../models/workspace';

@Injectable()
export class WorkspaceService {

  constructor(private http: Http) {
  }

  list(): Observable<Workspace[]> {
    return Observable.create(observer => {
      observer.next(Workspace.getData());
      observer.complete();
    });

  }
}
