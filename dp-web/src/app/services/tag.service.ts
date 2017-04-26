import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {HttpUtil} from "../shared/utils/httpUtil";
import {DatasetTag} from "../models/dataset-tag";

@Injectable()
export class DatasetTagService {
  url = '/api/dataset-tags';

  constructor(private http: Http) {
  }

  public list(): Observable<DatasetTag[]> {
    // return this.http
    //   .get(this.url, new RequestOptions(HttpUtil.getHeaders()))
    //   .map(HttpUtil.extractData)
    //   .catch(HttpUtil.handleError);

    return Observable.create(observer => {
      setTimeout(()=>observer.next(data), 300);
    });

  }
}
// Tags must have unique name.
var data = [{"name":"All", "count":895}
  ,  {"name":"Favourites", "count":53}
  ,  {"name":"Dataset01", "count":5}
  ,  {"name":"Classified", "count":15}
  ,  {"name":"Sales", "count":10}
  ,  {"name":"Marketing", "count":7}
  ,  {"name":"Finance", "count":22}
  ,  {"name":"HRD", "count":50}
  ,  {"name":"My Datasets", "count":201}
  ,  {"name":"Block", "count":53}
  ,  {"name":"Bla", "count":45}
  ,  {"name":"Awesome", "count":12}
  ,  {"name":"Recent", "count":342}
  ,  {"name":"Old", "count":23}

];
