import {Component, EventEmitter, Input, Output} from "@angular/core";
import {AssetTypeEnum} from "../../../ds-assets-list/ds-assets-list.component";

export class QueryObjectModel {
  searchText:string;
  type: AssetTypeEnum;
}


@Component({
  selector : "normlal-query-editor",
  templateUrl : "normal-query-editor.component.html",
  styleUrls: ["normal-query-editor.component.scss"]
})
export class NormalQueryEditor {
  public createdFilOptns:string[] = ['Whenever','Last 30 days', 'Last 60 days', 'Last 90 days'];
  public typeFilOptns : string[] = ['Any', 'HIVE', 'HDFS'];
  public sizeFilOptns : string[] = ['Any', '> 100 rows', '> 1000 rows', '> 10000 rows'];
  public dlFilOptns : string[] = ['Any', 'Lake-1', 'Lake-2'];
  public ownerFilOptn : string[] = ['Whoever', 'root', 'Amit', 'Vivek', 'Kishore'];

  public createdValueIndx:number = 0;
  public typeValueIndx : number = 0;
  public sizeValueIndx : number = 0;
  public dLakeIndx : number = 0;
  public ownerIndx : number = 0;

  public filterTags:string[] = [];
  public filterStateVisible:boolean = false;

  @Input() queryObj:QueryObjectModel;

  @Output('onQueryObjUpdate') notificationEmitter: EventEmitter<any> = new EventEmitter<any>();

  onNewSearch(text:string) {
    this.queryObj.searchText = text;
    this.notificationEmitter.emit("");
  }
  onFilterOptionChange(){
    this.filterTags.splice(0, this.filterTags.length);
    if(this.createdValueIndx > 0) this.filterTags.push('Created: '+this.createdFilOptns[this.createdValueIndx]);
    if(this.typeValueIndx > 0) this.filterTags.push('Type: '+this.typeFilOptns[this.typeValueIndx]);
    if(this.sizeValueIndx > 0) this.filterTags.push('Size: '+this.sizeFilOptns[this.sizeValueIndx]);
    if(this.dLakeIndx > 0) this.filterTags.push('Datalake: '+this.dlFilOptns[this.dLakeIndx]);
    if(this.ownerIndx > 0) this.filterTags.push('Owner: '+this.ownerFilOptn[this.ownerIndx]);

    var tmp = this.typeValueIndx, enm = AssetTypeEnum;
    this.queryObj.type = (tmp==0)?enm.ALL:((tmp==1)?enm.HIVE:((tmp==2)?enm.HDFS:enm.ALL))
  }
}
