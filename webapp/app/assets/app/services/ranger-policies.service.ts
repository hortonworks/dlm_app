import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataCenter} from '../models/data-center';
import {AtlasLineage} from '../models/altas-lineage';
import '../rxjs-operators';
import {RangerPolicies} from '../models/ranger-policies';

@Injectable()
export class RangerPoliciesService {

    url = '/api/ranger';

    constructor(private http: Http) {
    }


    get(resourceId: string, resourceType: string,
        dataLakeId: string, clusterId: string): Observable<any> {
        return this.getPolicies(resourceId, resourceType, dataLakeId, clusterId);

    }

    private getPolicies(resourceId: string, resourceType: string,
                        dataLakeId: string, clusterId: string): Observable<any> {
        return this.http.get(this.url + '/audit?clusterHost=' + clusterId + '&dc=' + dataLakeId + '&rt=' + resourceType + '&r=' + resourceId, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

}