import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Category} from '../models/category';

@Injectable()
export class CategoryService {
  url = '/api/datasets/categories';

  constructor(private http:Http) {}

  public list():Observable<Category[]> {
    return this.http
      .get(this.url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  insert(category: Category): Observable<Category> {
    return this.http
      .post(`${this.url}`, category, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }


}
