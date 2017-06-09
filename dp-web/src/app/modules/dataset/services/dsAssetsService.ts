import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {DsAssetModel} from "../models/dsAssetModel";
import {AssetCountModel} from "../models/richDatasetModel";
import {AssetSetQueryModel} from "../views/ds-assets-list/ds-assets-list.component";
import {HttpUtil} from "../../../shared/utils/httpUtil";
import off = L.DomEvent.off;

@Injectable()
export class DsAssetsService {
  url1 = "/api/query-assets";
  url2 = "/api/query-attributes";

  constructor(private http: Http) {
  }

  getQueryAttribute(clsId:number):Observable<any[]> {
    return this.http
      .get(`${this.url2}?clusterId=${clsId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
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

  list(asqms: AssetSetQueryModel[], pageNo: number, pageSize: number, clusterId:number): Observable<DsAssetModel[]> {
    console.log(asqms);
    let callAtlas = true, callDB:boolean|number = false;
    asqms.forEach(asqm => asqm.filters.forEach(filObj =>{
      if(filObj.dataType == "-") {callAtlas = false;}
      if(filObj.column == "dataset.id") {callDB = filObj.value as number;}
    }));
    if(callDB) {
      return this.dbQuery(callDB, (pageNo - 1) * pageSize, pageSize);
    }
    return (callAtlas)?this.atlasQuery(asqms, (pageNo - 1) * pageSize, pageSize, clusterId):Observable.create(observer => {
      const newData = [];
      asqms.forEach(asqm => {
        let cloneData = data.filter(obj => true); // cloning
        asqm.filters.forEach(filObj => cloneData = cloneData.filter(getFilterFunftion(filObj)));
        newData.push.apply(newData, cloneData);
      });
      setTimeout(() => observer.next(newData.slice((pageNo - 1) * pageSize, pageNo * pageSize)), 300);
    });
  }

  getAssetServiceQueryParam(asqms: AssetSetQueryModel[], offset:number, limit:number){
    return {
      "atlasFilters":this.getAtlasFilters(asqms),
      "limit":limit,
      "offset":offset
    };
  }
  getAtlasFilters(asqms: AssetSetQueryModel[]){
    let asqm, atlasFilters=[];
    asqms.forEach(asqm1 => asqm=asqm1);
    asqm.filters.forEach(filObj => {
      atlasFilters.push(
        {
          "atlasAttribute":{
            "name":filObj.column,
            "dataType":filObj.dataType
          },
          "operation":filObj.operator,
          "operand":filObj.value
        }
      )
    });
    return atlasFilters;
  }

  dbQuery (id: number, offset:number, limit:number) : Observable<DsAssetModel[]> {
    return this.http
      .get(`api/dataset/${id}/assets`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(rsp => this.extractAssetArrayFromDbData(rsp))
      .catch(HttpUtil.handleError)
  }

  atlasQuery(asqms: AssetSetQueryModel[], offset:number, limit:number, clusterId:number) : Observable<DsAssetModel[]> {
    let postParams=this.getAssetServiceQueryParam(asqms, offset, limit);
    return this.http
      .post(`${this.url1}?clusterId=${clusterId}`, postParams, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(rsp => rsp.entities)
      .map(rsp => this.extractAssetArrayFromAtlasData(rsp))
      .catch(HttpUtil.handleError)
  }

  extractAssetArrayFromDbData(dataArr: any[]) :DsAssetModel[]{
    let assetModelArr :DsAssetModel[] = [];
    dataArr && dataArr.forEach(ent=>{
      assetModelArr.push({
        creationTime: "-",
        id: ent.guid,
        name: ent.assetName,
        owner: "-",
        rowCount: 0,
        source: "hive",
        type: ent.assetType,
        clusterId: ent.clusterId
      })
    });
    return assetModelArr;
  }

  extractAssetArrayFromAtlasData(dataArr: any[]) :DsAssetModel[]{
    let assetModelArr :DsAssetModel[] = [];
    dataArr && dataArr.forEach(ent=>{
      assetModelArr.push({
        creationTime: "-",
        id: ent.guid,
        name: ent.displayText,
        owner: ent.attributes.owner || "-",
        rowCount: 0,
        source: "hive",
        type: ent.typeName,
        clusterId: null
      })
    });
    return assetModelArr;
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
