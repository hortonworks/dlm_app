import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild} from "@angular/core";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsAssetsService} from "../../services/dsAssetsService";
import {DsAssetModel} from "../../models/dsAssetModel";

export enum AssetTypeEnum { ALL, HIVE, HDFS}
export enum AssetListActionsEnum {EDIT, REMOVE, ADD}

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
  @ViewChild('table') table: ElementRef;

  @Output('onAction')
  actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  public pageSize : number = 8;
  private currentPageNo : number = 1;
  private assetsCount : number = 0;
  private totalPages : number = 1;
  public dsAssets: DsAssetModel[] = [];
  @Input() searchText:string = "";
  public tab = AssetTypeEnum;
  @Input() typeFilter: AssetTypeEnum = AssetTypeEnum.ALL;
  public actionEnum = AssetListActionsEnum;
  constructor(
    private dsAssetsService :DsAssetsService,
  ){}
  ngOnInit () {this.fetchAssets();}
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    (changes['dsModel'] || changes['searchText'] || changes['typeFilter']) &&  this.fetchAssets()
  }
  setFirstPage () {
    this.currentPageNo = 1;
  }
  fetchAssets () {
//    if(!this.dsModel.id) return;
    this.dsAssets.length >= this.pageSize && this.setTableHeight();
    this.dsAssets = [];
    var source:string = this.getAssetSourceAsString ();
    var modelId = (this.dsModel)?this.dsModel.id:0;
    this.dsAssetsService.count(modelId, this.searchText, source).subscribe(count=>{this.assetsCount=count; this.totalPages=Math.ceil(count/this.pageSize)});
    this.dsAssetsService.list(modelId, this.searchText, source, this.currentPageNo, this.pageSize).subscribe(assets=>{this.dsAssets=assets;});
  }
  getAssetSourceAsString ():string {
    if(this.typeFilter == this.tab.ALL) return "all";
    if(this.typeFilter == this.tab.HIVE) return "hive";
    if(this.typeFilter == this.tab.HDFS) return "file";
    return "all";
  }
  getPaginationText ():string  {
    return (this.pageSize * (this.currentPageNo-1) + 1) + "-" + Math.min(this.pageSize * this.currentPageNo, this.assetsCount) +" of " + this.assetsCount;
  }
  setTableHeight () {
    this.table.nativeElement.style.height = this.table.nativeElement.offsetHeight + "px";
  }
  showPrevious(){(this.currentPageNo != 1) && --this.currentPageNo && this.fetchAssets()}
  showNext() {this.currentPageNo < Math.ceil(this.assetsCount/this.pageSize) && ++this.currentPageNo && this.fetchAssets()}
  actionAddMore () {console.log("add-more called"); this.actionEmitter.emit(this.actionEnum.ADD);}
  actionRemove () {console.log("remove called")}
  actionEdit () {this.actionEmitter.emit(this.actionEnum.EDIT);}
}
