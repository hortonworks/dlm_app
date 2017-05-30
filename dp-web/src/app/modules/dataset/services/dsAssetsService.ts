import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {DsAssetModel} from "../models/dsAssetModel";
import {AssetCountModel} from "../models/richDatasetModel";
import {AssetSetQueryModel} from "../views/ds-assets-list/ds-assets-list.component";

@Injectable()
export class DsAssetsService {
  url1 = "/api/assets/dataset";

  constructor(private http: Http) {
  }

  count(asqms: AssetSetQueryModel[]): Observable<AssetCountModel> {
    return Observable.create(observer => {
      const newData = [];
      asqms.forEach(asqm => {
        let cloneData = data.filter(obj => true); // cloning
        asqm.filters.forEach(filObj => cloneData = cloneData.filter(getFilterFunftion(filObj)));
        newData.push.apply(newData, cloneData);
      });
      setTimeout(() => observer.next({
        allCount: newData.length,
        filesCount: newData.filter(obj => obj.source == "file").length,
        hiveCount: newData.filter(obj => obj.source == "hive").length
      }), 200);
    });
  }

  list(asqms: AssetSetQueryModel[], pageNo: number, pageSize: number): Observable<DsAssetModel[]> {
    return Observable.create(observer => {
      const newData = [];
      asqms.forEach(asqm => {
        let cloneData = data.filter(obj => true); // cloning
        asqm.filters.forEach(filObj => cloneData = cloneData.filter(getFilterFunftion(filObj)));
        newData.push.apply(newData, cloneData);
      });
      setTimeout(() => observer.next(newData.slice((pageNo - 1) * pageSize, pageNo * pageSize)), 300);
    });
  }

}

const getFilterFunftion = filObj => {
  if (filObj.column == "dataset.id") return obj => obj.id <= 5 + filObj.value;

  if (filObj.column == "asset.source") return obj => (filObj.value == "all") ? true : obj.source == filObj.value;

  if (filObj.column == "asset.name") {
    return obj => {
      if (filObj.operator == "==") return obj.name.toLowerCase() == filObj.value.toLowerCase();
      else return obj.name.toLowerCase().indexOf(filObj.value.toLowerCase()) != -1;
    };
  }

  if (filObj.column == "asset.owner.id") {
    const ownerName = ownersData.filter(obj => obj.id == filObj.value)[0].name;
    return obj => {
      if (filObj.operator == "==") return obj.owner.toLowerCase() == ownerName.toLowerCase();
      else return obj.owner.toLowerCase() != ownerName.toLowerCase();
    };
  }
  return () => true;
};

const ownersData = [
  {id: 0, name: "root"}, {id: 1, name: "Deep"}, {id: 2, name: "Jack"}, {id: 3, name: "Bob"}
];

const data =[
  {
    creationTime: "2016-10-18 07:16:23",
    id: 2,
    name: "US_Sales_2016",
    owner: "root",
    rowCount: 3219,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-12-12 22:10:03",
    id: 1,
    name: "Sales_2016",
    owner: "root",
    rowCount: 28,
    source: "file",
    type: "external_table",
  },
  {
    creationTime: "2016-03-10 10:54:42",
    id: 3,
    name: "Indian_Sales_2016",
    owner: "root",
    rowCount: 67283,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-04-08 08:41:52",
    id: 4,
    name: "Japanese_Sales_2016",
    owner: "root",
    rowCount: 784391,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-01-28 19:24:14",
    id: 5,
    name: "Finance_2016",
    owner: "root",
    rowCount: 23791,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-30 09:19:41",
    id: 6,
    name: "Tax_2016",
    owner: "root",
    rowCount: 237,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-02-02 17:38:16",
    id: 7,
    name: "Indian_Tax_2016",
    owner: "root",
    rowCount: 238479,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-11-09 15:17:24",
    id: 8,
    name: "US_Tax_2016",
    owner: "root",
    rowCount: 8987,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-17 20:26:55",
    id: 9,
    name: "UK_Sales_2016",
    owner: "root",
    rowCount: 288792,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-08-13 18:51:19",
    id: 10,
    name: "UK_Tax_2016",
    owner: "root",
    rowCount: 43228,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-12-12 22:10:03",
    id: 11,
    name: "Sales_2016",
    owner: "root",
    rowCount: 28,
    source: "file",
    type: "external_table",
  },
  {
    creationTime: "2016-10-18 07:16:23",
    id: 12,
    name: "US_Sales_2016",
    owner: "root",
    rowCount: 3219,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-03-10 10:54:42",
    id: 13,
    name: "Indian_Sales_2016",
    owner: "root",
    rowCount: 67283,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-04-08 08:41:52",
    id: 14,
    name: "Japanese_Sales_2016",
    owner: "root",
    rowCount: 784391,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-01-28 19:24:14",
    id: 15,
    name: "Finance_2016",
    owner: "root",
    rowCount: 23791,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-30 09:19:41",
    id: 16,
    name: "Tax_2016",
    owner: "root",
    rowCount: 237,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-02-02 17:38:16",
    id: 17,
    name: "Indian_Tax_2016",
    owner: "root",
    rowCount: 238479,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-11-09 15:17:24",
    id: 18,
    name: "US_Tax_2016",
    owner: "root",
    rowCount: 8987,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-17 20:26:55",
    id: 19,
    name: "UK_Sales_2016",
    owner: "root",
    rowCount: 288792,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-08-13 18:51:19",
    id: 20,
    name: "UK_Tax_2016",
    owner: "root",
    rowCount: 43228,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-12-12 22:10:03",
    id: 21,
    name: "Sales_2016",
    owner: "root",
    rowCount: 28,
    source: "file",
    type: "external_table",
  },
  {
    creationTime: "2016-10-18 07:16:23",
    id: 22,
    name: "US_Sales_2016",
    owner: "root",
    rowCount: 3219,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-03-10 10:54:42",
    id: 23,
    name: "Indian_Sales_2016",
    owner: "root",
    rowCount: 67283,
    source: "hive",
    type: "internal_table",
  },
  {
    creationTime: "2016-04-08 08:41:52",
    id: 24,
    name: "Japanese_Sales_2016",
    owner: "root",
    rowCount: 784391,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-01-28 19:24:14",
    id: 25,
    name: "Finance_2016",
    owner: "root",
    rowCount: 23791,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-30 09:19:41",
    id: 26,
    name: "Tax_2016",
    owner: "root",
    rowCount: 237,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-02-02 17:38:16",
    id: 27,
    name: "Indian_Tax_2016",
    owner: "root",
    rowCount: 238479,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-11-09 15:17:24",
    id: 28,
    name: "US_Tax_2016",
    owner: "root",
    rowCount: 8987,
    source: "hive",
    type: "external_table",
  },
  {
    creationTime: "2016-09-17 20:26:55",
    id: 29,
    name: "UK_Sales_2016",
    owner: "root",
    rowCount: 288792,
    source: "file",
    type: "internal_table",
  },
  {
    creationTime: "2016-08-13 18:51:19",
    id: 30,
    name: "UK_Tax_2016",
    owner: "root",
    rowCount: 43228,
    source: "hive",
    type: "external_table"
  }
];
