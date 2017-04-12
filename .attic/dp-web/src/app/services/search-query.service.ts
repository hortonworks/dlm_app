import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {SearchQuery} from '../models/search-query';

@Injectable()
export class SearchQueryService {
    url = '/api/search/';

    constructor(private http:Http) {}

    getData(searchQuery: SearchQuery, datasource: string): Observable<any[]> {
        return this.http.post(this.url + datasource , searchQuery, new RequestOptions(HttpUtil.getHeaders()))
            .map(HttpUtil.extractData).catch(HttpUtil.handleError);
    }
}
