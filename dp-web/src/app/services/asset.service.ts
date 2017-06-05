import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AssetProperty} from '../models/asset-property';
import {AssetTag} from '../models/asset-tag';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AssetSchema} from '../models/asset-schema';

@Injectable()
export class AssetService {
  uri = '/api/assets';

  constructor(private http: Http) {
  }

  getProperties(clusterId:string, assetId: string) : Observable<AssetProperty[]>{
    const uri = `${this.uri}/properties/${clusterId}/${assetId}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getSchemas(assetId: string){
    return Observable.of(AssetSchema.getAssetSchema());
  }
}
