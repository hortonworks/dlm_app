import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild} from "@angular/core";
import {AssetTypeEnum} from "../../../ds-assets-list/ds-assets-list.component";
import {TaggingWidgetTagModel} from "../../../../../../shared/tagging-widget/tagging-widget.component";
import {SearchWidget} from "./search-widget/search-widget.component";

export class SimpleQueryObjectModel {
  searchText:string;
  type: AssetTypeEnum = AssetTypeEnum.ALL;
  constructor(text:string){this.searchText=text;}
}

let TagModel=TaggingWidgetTagModel;

@Component({
  selector : "normlal-query-editor",
  templateUrl : "basic-query-editor.component.html",
  styleUrls: ["basic-query-editor.component.scss"]
})
export class BasicQueryEditor implements OnInit {
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

  public filterTags:TaggingWidgetTagModel[] = [];
  public filterStateFlag:boolean = false;

  @ViewChild('outerCont') outerCont:ElementRef;
  @ViewChild('searchWidget') searchWidget:SearchWidget;

  @Input() queryObj:SimpleQueryObjectModel;

  @Output('onQueryObjUpdate') notificationEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output('onHeightChange') heightEmitter: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit () {this.copyQryObjToWidget();}
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    (changes['queryObj']) &&  this.copyQryObjToWidget();
  }
  copyQryObjToWidget () {
    var enm = AssetTypeEnum, type=this.queryObj.type;
    this.typeValueIndx = (type==enm.ALL)?0:((type==enm.HIVE)?1:((type==enm.HDFS)?2:0))
    this._fillFilterTags();
  }
  onNewSearch(text:string) {
    this.queryObj.searchText = text;
    this.notificationEmitter.emit("");
  }
  _fillFilterTags() {
    this.filterTags.splice(0, this.filterTags.length);
    if(this.createdValueIndx > 0) this.filterTags.push(new TagModel('Created: '+this.createdFilOptns[this.createdValueIndx], "createdValueIndx"));
    if(this.typeValueIndx > 0) this.filterTags.push(new TagModel('Type: '+this.typeFilOptns[this.typeValueIndx], "typeValueIndx"));
    if(this.sizeValueIndx > 0) this.filterTags.push(new TagModel('Size: '+this.sizeFilOptns[this.sizeValueIndx], "sizeValueIndx"));
    if(this.dLakeIndx > 0) this.filterTags.push(new TagModel('Datalake: '+this.dlFilOptns[this.dLakeIndx], "dLakeIndx"));
    if(this.ownerIndx > 0) this.filterTags.push(new TagModel('Owner: '+this.ownerFilOptn[this.ownerIndx], "ownerIndx"));
  }
  onFilterOptionChange(){
    this._fillFilterTags();
    var tmp = this.typeValueIndx, enm = AssetTypeEnum;
    this.queryObj.type = (tmp==0)?enm.ALL:((tmp==1)?enm.HIVE:((tmp==2)?enm.HDFS:enm.ALL))
    // this.notificationEmitter.emit("");
  }
  removeFilter (deletedTagObj:TaggingWidgetTagModel) {
    this[deletedTagObj.data] = 0;
    this.onFilterOptionChange();
  }
  toggleFilterCont(){
    this.filterStateFlag = !this.filterStateFlag;
    ((thisObj)=>setTimeout(()=>thisObj.heightEmitter.emit(thisObj.outerCont.nativeElement.offsetHeight), 0))(this)

  }
}
