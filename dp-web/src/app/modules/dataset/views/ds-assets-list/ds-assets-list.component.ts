import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild} from "@angular/core";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsAssetsService} from "../../services/dsAssetsService";
import {DsAssetModel} from "../../models/dsAssetModel";

export enum Tab { ALL, HIVE, HDFS}
export enum AssetListActionsEnum {EDIT, REMOVE, ADD}

@Component({
  selector: 'ds-assets-list',
  templateUrl: './ds-assets-list.component.html',
  styleUrls: ['./ds-assets-list.component.scss'],
})
export class DsAssetList implements OnInit {

  @Input() dsModel : RichDatasetModel;
  @Input() applicableActions : AssetListActionsEnum[];
  @ViewChild('table') table: ElementRef;

  @Output('onAction')
  actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  public pageSize : number = 8;
  private currentPageNo : number = 1;
  private assetsCount : number = 0;
  private totalPages : number = 1;
  public dsAssets: DsAssetModel[] = [];
  public searchText:string = "";
  public tab = Tab;
  public activeTab: Tab = Tab.ALL;
  public actionEnum = AssetListActionsEnum;
  constructor(
    private dsAssetsService :DsAssetsService,
  ){}
  ngOnInit () {}
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) { changes['dsModel'] && this.dsModel && this.fetchAssets()}
  setFirstPage () {
    this.currentPageNo = 1;
  }
  fetchAssets () {
    console.log("fetchAssets called for dataset with id", this.dsModel.id);
    if(!this.dsModel.id) return;
    this.dsAssets.length >= this.pageSize && this.setTableHeight();
    this.dsAssets = [];
    var source:string = this.getAssetSourceAsString ();
    this.dsAssetsService.count(this.dsModel.id, this.searchText, source).subscribe(count=>{this.assetsCount=count; this.totalPages=Math.ceil(count/this.pageSize)});
    this.dsAssetsService.list(this.dsModel.id, this.searchText, source, this.currentPageNo, this.pageSize).subscribe(assets=>{this.dsAssets=assets;});
  }
  getAssetSourceAsString ():string {
    if(this.activeTab == this.tab.ALL) return "all";
    if(this.activeTab == this.tab.HIVE) return "hive";
    if(this.activeTab == this.tab.HDFS) return "file";
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
  actionAddMore () {console.log("add-more called")}
  actionRemove () {console.log("remove called")}
  actionEdit () {this.actionEmitter.emit(this.actionEnum.EDIT);}
}
