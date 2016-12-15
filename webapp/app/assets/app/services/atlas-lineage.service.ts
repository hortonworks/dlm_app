import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {DataCenter} from '../models/data-center';
import {HttpUtil} from '../shared/utils/httpUtil';
import '../rxjs-operators';
import {AtlasLineage} from '../models/altas-lineage';

@Injectable()
export class AtlasLineageService {
     url = '/api/datacenters/atlas/lineage';

    constructor(private http:Http) {
    }

    public getTable(host: string, dcName: string, tableName: string):Observable<{}> {
        return this.http.get('/api/datacenters/atlas/table?clusterHost='+host+'&dc='+dcName+'&table='+tableName+'&cached=true', new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }

    public getLineage(host: string, dcName: string, guid: string):Observable<DataCenter[]> {
        return this.http.get(this.url + '?clusterHost='+host+'&dc='+dcName+'&guid='+guid , new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}