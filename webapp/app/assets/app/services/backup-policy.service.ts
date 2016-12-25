import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BackupPolicy} from '../models/backup-policy';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';

@Injectable()
export class BackupPolicyService {
    url = '/api/backup-policies';
    private policy: BackupPolicy;

    constructor(private http:Http) {}

    public update(policy: BackupPolicy):Observable<any> {
        return this.http
          .put(this.url, policy, new RequestOptions(HttpUtil.getHeaders()))
          .map(HttpUtil.extractData)
          .catch(HttpUtil.handleError);
    }

    public create(policy: BackupPolicy):Observable<any> {
        return this.http
          .post(this.url, policy, new RequestOptions(HttpUtil.getHeaders()))
          .map(HttpUtil.extractData)
          .catch(HttpUtil.handleError);
    }

    public get():Observable<BackupPolicy[]> {
        return this.http
          .get(this.url , new RequestOptions(HttpUtil.getHeaders()))
          .map(HttpUtil.extractData)
          .catch(HttpUtil.handleError);
    }

    public  getById(id: string):Observable<BackupPolicy> {
        return this.http
          .get(`${this.url}/${id}` , new RequestOptions(HttpUtil.getHeaders()))
          .map(HttpUtil.extractData)
          .catch(HttpUtil.handleError);
    }
}
