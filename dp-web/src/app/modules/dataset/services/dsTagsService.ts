import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {HttpUtil} from "../../../shared/utils/httpUtil";

@Injectable()
export class DsTagsService {
  url = "/api/datasets/categories/";

  constructor(private http: Http) {
  }

  list(searchText: string, size: number): Observable<string[]> {
    return this.http
      .get(`${this.url}${searchText}?size=${size}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(res=>{
        let retArr=[];
        HttpUtil.extractData(res).forEach(data=>retArr.push(data.name));
        return retArr;
      })
      .catch(HttpUtil.handleError);
  }
}
