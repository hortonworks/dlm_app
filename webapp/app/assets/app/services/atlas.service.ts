import {Injectable} from '@angular/core';
import {AtlasEntity} from '../models/atlas-entity';
import {Observable} from 'rxjs/Observable';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataCenter} from '../models/data-center';
import {AtlasLineage} from '../models/altas-lineage';
import '../rxjs-operators';

@Injectable()
export class AtlasService {
    url = '/api/datacenters/atlas';

    constructor(private http:Http) {
    }

    public getTable(host: string, dcName: string, tableName: string):Observable<any> {
        return this.http.get(this.url + '/table?clusterHost='+host+'&dc='+dcName+'&table='+tableName+'&cached=true', new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getEntity(host: string, dcName: string, guid: string):Observable<any> {
        return this.http.get(this.url + '/entity?clusterHost='+host+'&dc='+dcName+'&guid='+guid , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getLineage(host: string, dcName: string, guid: string):Observable<any> {
        return this.http.get(this.url + '/lineage?clusterHost='+host+'&dc='+dcName+'&guid='+guid , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getAudit(host: string, dcName: string, guid: string):Observable<any> {
        return this.http.get(this.url + '/audit?clusterHost='+host+'&dc='+dcName+'&guid='+guid , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}
