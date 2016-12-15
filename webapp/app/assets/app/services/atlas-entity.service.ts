import {Injectable} from '@angular/core';
import {AtlasEntity} from '../models/atlas- entity';
import {Observable} from 'rxjs/Observable';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';

@Injectable()
export class AtlasEntityService {
    url = '/api/datacenters/atlas/entity';

    constructor(private http:Http) {
    }

    public getLineage(host: string, dcName: string, guid: string):Observable<AtlasEntity> {
        return this.http.get(this.url + '?clusterHost='+host+'&dc='+dcName+'&guid='+guid , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}