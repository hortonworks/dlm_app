import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {DsAssetModel} from "../models/dsAssetModel";

@Injectable()
export class DsAssetsService {
  url1 = '/api/assets/dataset'

  constructor(private http: Http) {
  }

  public count(dsId:number, searchText:string, source:string) : Observable<number> {
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data.filter(obj=>(source=='all')?true:obj.source==source).filter(obj=>obj.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1).length), 200);
    });
  }

  public list(dsId:number, searchText:string, source:string, pageNo:number, pageSize:number): Observable<DsAssetModel[]> {
    //console.log("DsAssetService List", dsId, pageNo, pageSize);
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data.filter(obj=>(source=='all')?true:obj.source==source).filter(obj=>obj.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1).slice((pageNo-1)*pageSize, pageNo*pageSize)), 300);
    });

  }

}

var data =
  [
    {"id":1,"name": "Sales_2016","source": "file","owner": "root","rowCount": 28,"type": "external_table","creationTime":"2016-12-12 22:10:03"}
,   {"id":2,"name": "US_Sales_2016","source": "hive","owner": "root","rowCount": 3219,"type": "internal_table","creationTime":"2016-10-18 07:16:23"}
,   {"id":3,"name": "Indian_Sales_2016","source": "hive","owner": "root","rowCount": 67283,"type": "internal_table","creationTime":"2016-03-10 10:54:42"}
,   {"id":4,"name": "Japanese_Sales_2016","source": "hive","owner": "root","rowCount": 784391,"type": "external_table","creationTime":"2016-04-08 08:41:52"}
,   {"id":5,"name": "Finance_2016","source": "hive","owner": "root","rowCount": 23791,"type": "external_table","creationTime":"2016-01-28 19:24:14"}
,   {"id":6,"name": "Tax_2016","source": "file","owner": "root","rowCount": 237,"type": "internal_table","creationTime":"2016-09-30 09:19:41"}
,   {"id":7,"name": "Indian_Tax_2016","source": "hive","owner": "root","rowCount": 238479,"type": "external_table","creationTime":"2016-02-02 17:38:16"}
,   {"id":8,"name": "US_Tax_2016","source": "hive","owner": "root","rowCount": 8987,"type": "external_table","creationTime":"2016-11-09 15:17:24"}
,   {"id":9,"name": "UK_Sales_2016","source": "file","owner": "root","rowCount": 288792,"type": "internal_table","creationTime":"2016-09-17 20:26:55"}
,   {"id":10,"name": "UK_Tax_2016","source": "hive","owner": "root","rowCount": 43228,"type": "external_table","creationTime":"2016-08-13 18:51:19"}
,   {"id":11,"name": "Sales_2016","source": "file","owner": "root","rowCount": 28,"type": "external_table","creationTime":"2016-12-12 22:10:03"}
,   {"id":12,"name": "US_Sales_2016","source": "hive","owner": "root","rowCount": 3219,"type": "internal_table","creationTime":"2016-10-18 07:16:23"}
,   {"id":13,"name": "Indian_Sales_2016","source": "hive","owner": "root","rowCount": 67283,"type": "internal_table","creationTime":"2016-03-10 10:54:42"}
,   {"id":14,"name": "Japanese_Sales_2016","source": "hive","owner": "root","rowCount": 784391,"type": "external_table","creationTime":"2016-04-08 08:41:52"}
,   {"id":15,"name": "Finance_2016","source": "hive","owner": "root","rowCount": 23791,"type": "external_table","creationTime":"2016-01-28 19:24:14"}
,   {"id":16,"name": "Tax_2016","source": "file","owner": "root","rowCount": 237,"type": "internal_table","creationTime":"2016-09-30 09:19:41"}
,   {"id":17,"name": "Indian_Tax_2016","source": "hive","owner": "root","rowCount": 238479,"type": "external_table","creationTime":"2016-02-02 17:38:16"}
,   {"id":18,"name": "US_Tax_2016","source": "hive","owner": "root","rowCount": 8987,"type": "external_table","creationTime":"2016-11-09 15:17:24"}
,   {"id":19,"name": "UK_Sales_2016","source": "file","owner": "root","rowCount": 288792,"type": "internal_table","creationTime":"2016-09-17 20:26:55"}
,   {"id":20,"name": "UK_Tax_2016","source": "hive","owner": "root","rowCount": 43228,"type": "external_table","creationTime":"2016-08-13 18:51:19"}
,   {"id":21,"name": "Sales_2016","source": "file","owner": "root","rowCount": 28,"type": "external_table","creationTime":"2016-12-12 22:10:03"}
,   {"id":22,"name": "US_Sales_2016","source": "hive","owner": "root","rowCount": 3219,"type": "internal_table","creationTime":"2016-10-18 07:16:23"}
,   {"id":23,"name": "Indian_Sales_2016","source": "hive","owner": "root","rowCount": 67283,"type": "internal_table","creationTime":"2016-03-10 10:54:42"}
,   {"id":24,"name": "Japanese_Sales_2016","source": "hive","owner": "root","rowCount": 784391,"type": "external_table","creationTime":"2016-04-08 08:41:52"}
,   {"id":25,"name": "Finance_2016","source": "hive","owner": "root","rowCount": 23791,"type": "external_table","creationTime":"2016-01-28 19:24:14"}
,   {"id":26,"name": "Tax_2016","source": "file","owner": "root","rowCount": 237,"type": "internal_table","creationTime":"2016-09-30 09:19:41"}
,   {"id":27,"name": "Indian_Tax_2016","source": "hive","owner": "root","rowCount": 238479,"type": "external_table","creationTime":"2016-02-02 17:38:16"}
,   {"id":28,"name": "US_Tax_2016","source": "hive","owner": "root","rowCount": 8987,"type": "external_table","creationTime":"2016-11-09 15:17:24"}
,   {"id":29,"name": "UK_Sales_2016","source": "file","owner": "root","rowCount": 288792,"type": "internal_table","creationTime":"2016-09-17 20:26:55"}
,   {"id":30,"name": "UK_Tax_2016","source": "hive","owner": "root","rowCount": 43228,"type": "external_table","creationTime":"2016-08-13 18:51:19"}
  ]
