import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Subject} from 'rxjs/Subject';
import {Group, GroupList} from '../models/group';

@Injectable()
export class GroupService {

  url = '/api/groups';
  dataChanged = new Subject<boolean>();
  dataChanged$ = this.dataChanged.asObservable();

  constructor(private http: Http) {
  }

  getAllGroups(offset: number, pageSize: number, searchTerm?: string): Observable<GroupList> {
    let url = `${this.url}?offset=${offset}&pageSize=${pageSize}`;
    if (searchTerm && searchTerm.trim().length > 0) {
      url = `${url}&searchTerm=${searchTerm}`;
    }
    return this.http
      .get(url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  addGroups(groups: string[], roles: string[]): Observable<any[]> {
    return this.http
      .post(`${this.url}/add`, {groups: groups, roles: roles}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  addAdminGroups(groups: string[]): Observable<any[]> {
    return this.http
      .post(`${this.url}/admin`, {groups: groups}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  updateGroup(group: Group): Observable<Group> {
    return this.http
      .post(`${this.url}/update`, group, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getGroupByName(name: string): Observable<Group> {
    let url = `${this.url}/${name}`;
    return this.http
      .get(url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
