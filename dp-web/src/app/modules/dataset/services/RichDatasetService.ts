import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {RichDatasetModel} from "../models/richDatasetModel";
import {AssetSetQueryModel} from "../views/ds-assets-list/ds-assets-list.component";
import {DsAssetsService} from "./dsAssetsService";
import {DataSetAndCategories} from "../../../models/data-set";
import {HttpUtil} from "../../../shared/utils/httpUtil";
@Injectable()
export class RichDatasetService {
  url1 = "/api/dataset/list/tag";
  url2 = "/api/dataset";
  url3 = "/api/atlas-dataset";

  constructor(private http: Http) {
  }

  listByTag(tagName: string, nameSearchText : string, start: number, limit: number): Observable<RichDatasetModel[]> {
    let url = `${this.url1}/${tagName}?offset=${start}&size=${limit}`;
    nameSearchText && (url += `&search=${nameSearchText}`);
    return this.http
      .get(url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res => this.extractRichDataArray(res))
      .catch(HttpUtil.handleError);
  }

  getById(id: number): Observable<RichDatasetModel> {
    return this.http
      .get(`${this.url2}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res => this.extractRichDataModel(res))
      .catch(HttpUtil.handleError);
  }

  saveDataset(dataSet: RichDatasetModel, asqms: AssetSetQueryModel[], tags: string[]): Observable<DataSetAndCategories> {
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

  extractRichDataModel(data: any): RichDatasetModel {
    return {
      id: data.dataset.id,
      name: data.dataset.name,
      description: data.dataset.description,
      datalakeId: data.dataset.dpClusterId,
      datalakeName: data.cluster,
      clusterId : data.clusterId,
      creatorId: data.dataset.createdBy,
      creatorName: data.user,
      favourite: (data.tags.indexOf("favourite") != -1),
      counts: {hiveCount: data.counts[0].count, filesCount: 0}
    } as RichDatasetModel;
  }

  extractRichDataArray(datas: any[]): RichDatasetModel[] {
    let retArr: RichDatasetModel[] = [];
    datas.forEach(data => {
      retArr.push(this.extractRichDataModel(data))
    });
    return retArr
  }
}
