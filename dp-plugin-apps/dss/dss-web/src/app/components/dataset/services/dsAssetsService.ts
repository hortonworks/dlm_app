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
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {DsAssetModel, AssetsAndCount} from "../models/dsAssetModel";
import {AssetSetQueryModel} from "../views/ds-assets-list/ds-assets-list.component";
import {HttpUtil} from "../../../shared/utils/httpUtil";

@Injectable()
export class DsAssetsService {
  url1 = "api/query-assets";
  url2 = "api/query-attributes";

  constructor(private http: Http) {
  }

  getQueryAttribute(clsId:number):Observable<any[]> {
    return this.http
      .get(`${this.url2}?clusterId=${clsId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  list(asqms: AssetSetQueryModel[], pageNo: number, pageSize: number, clusterId:number): Observable<AssetsAndCount> {
    console.log(asqms);
    let search:string = "", callDB:boolean|number = false;
    asqms.forEach(asqm => asqm.filters.forEach(filObj =>{
      if(filObj.column == "dataset.id") {callDB = filObj.value as number;}
      if(filObj.column == "name") {search = filObj.value as string;}
    }));
    if(callDB) {
      return this.dbQuery(callDB, search, (pageNo - 1) * pageSize, pageSize);
    }
    return this.atlasQuery(asqms, (pageNo - 1) * pageSize, pageSize, clusterId);
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

  dbQuery (id: number, searchText:string, offset:number, limit:number) : Observable<AssetsAndCount> {
    return this.http
      .get(`api/dataset/${id}/assets?queryName=${searchText}&offset=${offset}&limit=${limit}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(rsp => this.extractAssetArrayFromDbData(rsp))
      .catch(HttpUtil.handleError)
  }

  atlasQuery(asqms: AssetSetQueryModel[], offset:number, limit:number, clusterId:number) : Observable<AssetsAndCount> {
    let postParams=this.getAssetServiceQueryParam(asqms, offset, limit);
    return this.http
      .post(`${this.url1}?clusterId=${clusterId}`, postParams, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(rsp => this.extractAssetArrayFromAtlasData(rsp))
      .catch(HttpUtil.handleError)
  }

  tagsQuery(clusterId: number): Observable<string[]> {
    const uri = `api/assets/typeDefs/${clusterId}/classification`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(data => data.classificationDefs.map(cTagObj => cTagObj.name))
      .catch(HttpUtil.handleError)

  }

  extractAssetArrayFromDbData(assetsNCount: any) :AssetsAndCount{
    let assetModelArr :DsAssetModel[] = [];
    let dataArr = assetsNCount.assets;
    dataArr && dataArr.forEach(ent=>{
      assetModelArr.push({
        createdTime: ent.assetProperties.createTime?((new Date(parseInt(ent.assetProperties.createTime))).toDateString()):"-",
        id: ent.guid,
        name: ent.assetProperties.name || "-",
        description : ent.assetProperties.description || "-",
        owner: ent.assetProperties.owner || "-",
        dbName: ent.assetProperties.qualifiedName.split(".")[0] || "-",
        source: "hive",
        type: ent.assetType,
        clusterId: ent.clusterId
      })
    });
    return {"assets":assetModelArr, "count": assetsNCount.count} as AssetsAndCount;
  }

  extractAssetArrayFromAtlasData(dataArr: any[]) :AssetsAndCount{
    let assetModelArr :DsAssetModel[] = [];
    dataArr && dataArr.forEach(ent=>{
      assetModelArr.push({
        createdTime: ent.attributes.createTime?((new Date(parseInt(ent.attributes.createTime))).toDateString()):"-",
        id: ent.guid,
        name: ent.displayText,
        description : ent.attributes.description || "-",
        owner: ent.attributes.owner || "-",
        source: "hive",
        type: ent.typeName,
        clusterId: null,
        dsName:ent.datasetName,
        dbName:ent.attributes.qualifiedName.split(".")[0]
      })
    });
    return {"assets":assetModelArr, "count": null} as AssetsAndCount;
  }
}
