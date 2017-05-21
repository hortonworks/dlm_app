import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild} from "@angular/core";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsAssetsService} from "../../services/dsAssetsService";
import {DsAssetModel} from "../../models/dsAssetModel";

export enum AssetTypeEnum { ALL, HIVE, HDFS};
export var AssetTypeEnumString = ["all", "hive", "file"];
export enum AssetListActionsEnum {EDIT, REMOVE, ADD}
export class AssetSetQueryFilterModel {
  column:string;
  operator:string;
  value:(string|number);
}
class ASQFM extends AssetSetQueryFilterModel {};

export class AssetSetQueryModel {
  constructor(public filters:AssetSetQueryFilterModel[]){}
}
class ASQM extends AssetSetQueryModel {};



@Component({
  selector: 'ds-assets-list',
  templateUrl: './ds-assets-list.component.html',
  styleUrls: ['./ds-assets-list.component.scss'],
})
export class DsAssetList implements OnInit {

  @Input() dsModel : RichDatasetModel;
  @Input() applicableActions : AssetListActionsEnum[];
  @Input() hideTabs:boolean = false;
  @Input() hideSearch:boolean = false;
  @Input() innerListScrollable:boolean = false;
  @Input() selectionAllowed:boolean = true;
  @Input() queryModels:(ASQM|ASQM[]);
  @Input() avoidLoadingOnInit:boolean=false;
  @Input() searchText:string = "";
  @Input() typeFilter: AssetTypeEnum = AssetTypeEnum.ALL;

  @ViewChild('table') table: ElementRef;
  @ViewChild('outerCont') outerCont:ElementRef;
  @ViewChild('listCont') listCont:ElementRef;

  @Output('onAction')
  actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  public pageSizeOptions:number[] = [10,15,20,50,100,150,200];
  public pageSize : number = 10;
  private currentPageNo : number = 1;
  private assetsCount : number = 0;
  private totalPages : number = 1;
  public dsAssets: DsAssetModel[] = [];
  public tab = AssetTypeEnum;
  public actionEnum = AssetListActionsEnum;
  private tableHeight:number = 0
  constructor(
    private dsAssetsService :DsAssetsService,
  ){}
  private initDone:boolean=false;
  ngOnInit () {
    if(this.innerListScrollable) this.outerCont.nativeElement.classList.add('innerListScrollable');
    this.setTableHeight();
    !this.avoidLoadingOnInit && this.fetchAssets();
    this.initDone = true;
  }
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    this.initDone && (changes['dsModel'] || changes['searchText']|| changes['queryModels'] || changes['pageSize']) &&  this.fetchAssets()
  }
  setFirstPage () {
    this.currentPageNo = 1;
  }
  clearResults() {
    this.dsAssets = [];
    this.totalPages = this.assetsCount = 0;
  }
  getQueryModelsForAssetService (countQuery:boolean) {
    var asqms:ASQM[]=[], asqmsClone:ASQM[]=[], qmdls=this.queryModels;
    qmdls && asqms.push.apply(asqms,(qmdls.constructor.name == "Array")?qmdls:[qmdls]); // make sure its an array of asqm
    if(!asqms.length) asqms.push(new ASQM([])); // make sure its not empty
    asqms.forEach(asqm => {
      var newAsqm = new ASQM([]);
      newAsqm.filters.push.apply(newAsqm.filters, asqm.filters);
      if(!this.hideSearch) newAsqm.filters.push({column:"asset.name", operator:"contains", value:this.searchText});
      if(!this.hideTabs && !countQuery) newAsqm.filters.push({column:"asset.source", operator:"==", value:AssetTypeEnumString[this.typeFilter]});
      asqmsClone.push(newAsqm)
    });
    return asqmsClone;
  }
  fetchAssets () {
    this.dsAssets = [];
    var asqms=this.getQueryModelsForAssetService(true), tab=this.tab, tpfltr = this.typeFilter;
    this.dsAssetsService.count(asqms)
      .subscribe(countModel=>{
        this.dsModel && (this.dsModel.counts=countModel);
        this.assetsCount=countModel[(tpfltr==tab.HIVE)?"hiveCount":(tpfltr==tab.HDFS)?"filesCount":"allCount"];
        this.totalPages=Math.ceil(this.assetsCount/this.pageSize)
      });
    asqms=this.getQueryModelsForAssetService(false)
    this.dsAssetsService.list(asqms, this.currentPageNo, this.pageSize)
      .subscribe(assets=>{
        this.dsAssets=assets;
        ((thisObj)=>setTimeout(()=>{/*thisObj.dsAssets.length >= thisObj.pageSize && */thisObj.setTableHeight()},0))(this);
      });
  }
  getAssetSourceAsString (type:AssetTypeEnum):string {
    if(type == this.tab.ALL) return "all";
    if(type == this.tab.HIVE) return "hive";
    if(type == this.tab.HDFS) return "file";
    return "all";
  }
  getPaginationText ():string  {
    return (this.pageSize * (this.currentPageNo-1) + 1) + "-" + Math.min(this.pageSize * this.currentPageNo, this.assetsCount) +" of " + this.assetsCount;
  }
  calcTableHeight() {
    if(this.tableHeight) return this.tableHeight
    var heightAboveTable = this.table.nativeElement.offsetTop - this.listCont.nativeElement.offsetTop;
    var paginationHeight = this.listCont.nativeElement.offsetHeight - this.table.nativeElement.offsetHeight - heightAboveTable;
    heightAboveTable = this.table.nativeElement.offsetTop - this.outerCont.nativeElement.offsetTop;
    return this.tableHeight = this.outerCont.nativeElement.offsetHeight - heightAboveTable - paginationHeight;
  }
  setTableHeight () {
    this.table.nativeElement.style.height = "auto";
    this.table.nativeElement.style.height = ((this.innerListScrollable)?this.calcTableHeight():this.table.nativeElement.offsetHeight) + "px";
  }
  resize () {
      this.tableHeight=0;
      this.setTableHeight();
  }
  onPageSizeChange() {this.fetchAssets();}
  showPrevious(){(this.currentPageNo != 1) && --this.currentPageNo && this.fetchAssets()}
  showNext() {this.currentPageNo < Math.ceil(this.assetsCount/this.pageSize) && ++this.currentPageNo && this.fetchAssets()}
  actionAddMore () {console.log("add-more called"); this.actionEmitter.emit(this.actionEnum.ADD);}
  actionRemove () {console.log("remove called");this.actionEmitter.emit(this.actionEnum.REMOVE);}
  actionEdit () {this.actionEmitter.emit(this.actionEnum.EDIT);}
}
