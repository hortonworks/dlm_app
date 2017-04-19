import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataSetAndCategories, DataSetAndCategoryIds, DataSet} from '../models/data-set';


@Injectable()
export class DataSetService {
  url = '/api/datasets';

  constructor(private http:Http) {}

  public list():Observable<DataSet[]> {
    return this.http
      .get(this.url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  post(data: DataSetAndCategoryIds): Observable<DataSetAndCategories> {
    data.dataset.createdBy=0;
    return this.http
      .post(`${this.url}`, data, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  put(data: DataSetAndCategoryIds): Observable<DataSetAndCategories> {
    return this.http
      .put(`${this.url}`, data, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  get(datasetId: number): Observable<DataSetAndCategories> {
    return this.http
      .get(`${this.url}/${datasetId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
