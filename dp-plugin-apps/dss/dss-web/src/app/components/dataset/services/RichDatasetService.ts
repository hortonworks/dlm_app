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
import {RichDatasetModel} from "../models/richDatasetModel";
import {AssetSetQueryModel} from "../views/ds-assets-list/ds-assets-list.component";
import {DsAssetsService} from "./dsAssetsService";
import {DataSetAndCategories, DataSetAndTags} from "../../../models/data-set";
import {HttpUtil} from "../../../shared/utils/httpUtil";
@Injectable()
export class RichDatasetService {
  url1 = "api/dataset/list/tag";
  url2 = "api/dataset";
  url3 = "api/atlas-dataset";

  constructor(private http: Http) {
  }

  listByTag(tagName: string, nameSearchText : string, start: number, limit: number, bookmarkFilter: boolean): Observable<RichDatasetModel[]> {
    let url = `${this.url1}/${tagName}?offset=${start}&size=${limit}`;
    if(bookmarkFilter){
      url = url+`&filter=bookmark`;
    }
    nameSearchText && (url += `&search=${nameSearchText}`);
    return this.http
      .get(url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res => this.extractRichDataArray(res))
      .catch(HttpUtil.handleError);
  }

  getById(id: number, editContext:boolean=false): Observable<RichDatasetModel> {
    return this.http
      .get(`${this.url2}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((res, indx) => this.extractRichDataModel(res, indx, editContext))
      .catch(HttpUtil.handleError);
  }

  saveDatasetWithAssets(dataSet: RichDatasetModel, asqms: AssetSetQueryModel[], tags: string[]): Observable<DataSetAndCategories> {
    const postObj = {
      "dataset": {
        "name": dataSet.name, "description": dataSet.description, "dpClusterId": +dataSet.datalakeId, "createdBy": 1
      },
      "clusterId": dataSet.clusterId,
      "tags": tags,
      "assetQueryModels": [{"atlasFilters": DsAssetsService.prototype.getAtlasFilters(asqms)}]

    };
    return this.http
      .post(`${this.url3}`, postObj, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  saveDataset(dSetAndTags: DataSetAndTags) : Observable<RichDatasetModel> {
    return this.http[(dSetAndTags.dataset.id)?'put':'post']
      ("/api/datasets", dSetAndTags, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(this.extractRichDataModel)
      .catch(HttpUtil.handleError);
  }
  addAssets(dSetId: number, clusterId: number, asqms: AssetSetQueryModel[], exceptions: string[] = [], editContext:boolean=true) : Observable<RichDatasetModel> {
    const postObj = {
      datasetId: dSetId,
      clusterId: clusterId,
      assetQueryModel: {"atlasFilters": DsAssetsService.prototype.getAtlasFilters(asqms)},
      exceptions : exceptions
    }
    return this.http
      .post("/api/add-atlas-assets", postObj, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data, indx) =>this.extractRichDataModel(data, indx, editContext))
      .catch(HttpUtil.handleError);
  }

  addSelectedAssets(dSetId: number, clusterId: number, selection: string[], editContext:boolean=true) : Observable<RichDatasetModel> {
    const postObj = {
      datasetId: dSetId,
      clusterId: clusterId,
      guids : selection
    }
    return this.http
      .post("/api/add-selected-atlas-assets", postObj, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data, indx) =>this.extractRichDataModel(data, indx, editContext))
      .catch(HttpUtil.handleError);
  }

  deleteAllAssets(dSetId: number, editContext:boolean=true) : Observable<RichDatasetModel> {
    return this.http
      .delete(`/api/dataset/${dSetId}/allassets`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data, indx) =>this.extractRichDataModel(data, indx, editContext))
      .catch(HttpUtil.handleError);
  }

  deleteSelectedAssets(dSetId: number, ids: string[], editContext:boolean=true) : Observable<RichDatasetModel> {
    let qStr = "";
    ids.forEach((id, indx)=>{
      if(indx) qStr = qStr + "&";
      qStr = qStr + "ids=" + id;
    })
    return this.http
      .delete(`/api/dataset/${dSetId}/assets?${qStr}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data, indx) =>this.extractRichDataModel(data, indx, editContext))
      .catch(HttpUtil.handleError);
  }

  beginEdit(dSetId: number) : Observable<RichDatasetModel> {
    return this.http
      .post(`/api/dataset/${dSetId}/begin-edit`,{}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(this.extractRichDataModel)
      .catch(HttpUtil.handleError);
  }

  saveEdition(dSetId: number) : Observable<RichDatasetModel> {
    return this.http
      .post(`/api/dataset/${dSetId}/save-edit`,{}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(this.extractRichDataModel)
      .catch(HttpUtil.handleError);
  }

  cancelEdition(dSetId: number) : Observable<RichDatasetModel> {
    return this.http
      .post(`/api/dataset/${dSetId}/cancel-edit`,{}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(this.extractRichDataModel)
      .catch(HttpUtil.handleError);
  }

  extractRichDataModel(data: any, index:number, editableContext:boolean=false): RichDatasetModel { // converts RichDataset(backend case class) to RichDatasetModel
    const ASSET_TYPES = [{label: 'hiveCount', key: 'hive_table'}, {label: 'filesCount', key: 'hdfs_files'}];

    return {
      id: data.dataset.id,
      name: data.dataset.name,
      description: data.dataset.description,
      datalakeId: data.dataset.dpClusterId,
      datalakeName: data.cluster,
      clusterId : data.clusterId,
      creatorId: data.dataset.createdBy,
      createdOn: data.dataset.createdOn,
      lastModified: data.dataset.lastModified,
      version : data.dataset.version,
      creatorName: data.user,
      favourite: (data.tags.indexOf("favourite") != -1),
      counts: ASSET_TYPES.reduce((accumulator, cAssetType) => {
        const tAssetType = data.counts.find(cCount => (cCount.assetType === cAssetType.key) && (editableContext?(cCount.assetState === "Edit"):true));
        accumulator[cAssetType.label] = tAssetType ? tAssetType.count : 0;
        return accumulator;
      }, {}),
      tags:data.tags,
      sharedStatus: data.dataset.sharedStatus,
      favouriteId: data.favouriteId,
      favouriteCount: data.favouriteCount,
      bookmarkId: data.bookmarkId,
      totalComments: data.totalComments,
      avgRating: data.avgRating,
      editDetails: data.editDetails
    } as RichDatasetModel;
  }

  extractRichDataArray(datas: any[]): RichDatasetModel[] {
    let retArr: RichDatasetModel[] = [];
    datas.forEach((data, indx) => {
      retArr.push(this.extractRichDataModel(data, indx))
    });
    return retArr
  }
}
