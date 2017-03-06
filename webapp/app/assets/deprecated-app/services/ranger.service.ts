import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataCenter} from '../models/data-center';
import {AtlasLineage} from '../models/altas-lineage';
import '../rxjs-operators';
import {RangerPolicies} from '../models/ranger-policies';

@Injectable()
export class RangerService {

    url = '/api/ranger';

    constructor(private http: Http) {
    }

    public getPolicies(resourceId: string, resourceType: string,
                        dataLakeId: string, clusterId: string): Observable<any> {
        return this.http.get(this.url + '/audit?clusterHost=' + clusterId + '&dc=' + dataLakeId + '&rt=' + resourceType + '&r=' + resourceId, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getAccess(
      resourceId: string,
      resourceType: string,
      dataLakeId: string,
      clusterId: string
    ): Observable<any[]> {
      return this.http
        .get(`${this.url}/access?clusterHost=${clusterId}&dc=${dataLakeId}&rt=${resourceType}&r=${resourceId}`, new RequestOptions(HttpUtil.getHeaders()))
        .map(HttpUtil.extractData)
        .map(data => data.facet_counts && data.facet_counts.facet_fields && data.facet_counts.facet_fields.access)
        .map(access => {
          return access
            .filter((cAccessItem, index) => index % 2 === 0 && cAccessItem !== null)
            .map((cAccessKey, index) => ({
              label: cAccessKey,
              value: access[index * 2 + 1]
            }));
        })
        .catch(HttpUtil.handleError);
    }

    public getUsers(
      resourceId: string,
      resourceType: string,
      dataLakeId: string,
      clusterId: string
    ): Observable<any[]> {
      return this.http
        .get(`${this.url}/users?clusterHost=${clusterId}&dc=${dataLakeId}&rt=${resourceType}&r=${resourceId}`, new RequestOptions(HttpUtil.getHeaders()))
        .map(HttpUtil.extractData)
        .map(data => data.facet_counts && data.facet_counts.facet_fields && data.facet_counts.facet_fields.reqUser)
        .map(reqUser => {
          return reqUser
            .filter((cUserItem, index) => index % 2 === 0 && cUserItem !== null)
            .map((cUserKey, index) => ({
              label: cUserKey,
              value: reqUser[index * 2 + 1]
            }));
        })
        .catch(HttpUtil.handleError);
    }

}
