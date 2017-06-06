import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {AssetOwnerModel} from "../models/assetOwnerModel";

@Injectable()
export class AssetOwnerService {
  url = "/api/owner";

  constructor(private http: Http) {
  }

  list(): Observable<AssetOwnerModel[]> {
    return Observable.create(observer => {
      setTimeout(() => observer.next(data), 300);
    });
  }
}
const data = [
  {id: 0, name: "root"}, {id: 1, name: "Deep"}, {id: 2, name: "Jack"}, {id: 3, name: "Bob"}
];
