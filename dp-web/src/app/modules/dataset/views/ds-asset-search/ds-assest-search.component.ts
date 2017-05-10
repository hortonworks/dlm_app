import {Component} from "@angular/core";
import {QueryObjectModel} from "./queryEditors/normal/normal-query-editor.component";


export enum DsAssetSearchTabEnum { NORMAL, ADVANCE}

@Component({
  selector:'asset-search',
  templateUrl:'./ds-asset-search.component.html',
  styleUrls:['./ds-asset-search.component.scss']
})
export class DsAssetSearch {
  public tabEnum = DsAssetSearchTabEnum;
  public activeTab = this.tabEnum.NORMAL;
  public queryObj:QueryObjectModel = new QueryObjectModel();

  public assetName:string="";
  fireNewQuery (flag:any) {
    console.log("Noticed event!!! ", this.queryObj.searchText );
    this.assetName = this.queryObj.searchText;
  }
}
