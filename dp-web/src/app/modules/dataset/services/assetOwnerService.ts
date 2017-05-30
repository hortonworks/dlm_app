import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {AssetOwnerModel} from "../models/assetOwnerModel";

@Injectable()
export class AssetOwnerService {
  url = '/api/owner'

  constructor(private http: Http) {
  }
  public list(): Observable<AssetOwnerModel[]> {
    //console.log("DsAssetService List", dsId, pageNo, pageSize);
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data), 300);
    });
  }
}
var data = [
  {id:0, name:"root"},{id:1, name:"Deep"},{id:2, name:"Jack"},{id:3, name:"Bob"}
]
