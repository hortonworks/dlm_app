/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {AssetOwnerModel} from "../models/assetOwnerModel";

@Injectable()
export class AssetOwnerService {
  url = "api/owner";

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
