import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from "rxjs";
import {Subject} from 'rxjs/Subject';
import {Workspace} from '../models/workspace';
import {HttpUtil} from '../shared/utils/httpUtil';
import {WorkspaceDTO} from '../models/workspace-dto';


@Injectable()
export class WorkspaceService {
  private url = '/api/workspaces';
  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

  dataChanged = new Subject<boolean>();
  dataChanged$ = this.dataChanged.asObservable();
  
  constructor(private http: Http) {
  }

  listDTO(): Observable<WorkspaceDTO[]> {
    return this.http.get(this.url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getDTOByName(name: string): Observable<WorkspaceDTO> {
    return this.http.get(this.url + '/name/' + name, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  save(workspace: Workspace): Observable<Workspace> {
    return this.http.post(this.url, workspace, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  delete(name: string): Observable<Workspace> {
    return this.http.delete(this.url + '/name/' + name, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
