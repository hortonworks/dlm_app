import {
  Component, ComponentFactoryResolver, ComponentRef, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,
  ViewContainerRef
} from "@angular/core";
import {AssetOwnerModel} from "../../../../models/assetOwnerModel";
import {AssetOwnerService} from "../../../../services/assetOwnerService";
import {QueryFilter} from "./filter/filter.component";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../../../ds-assets-list/ds-assets-list.component";


@Component({
  selector : "advance-query-editor",
  template : `
    <div>
      <span #filterCont></span>
      <div class="mdl-color--blue mdl-color-text--white mdl-button" (click)="addNewFilter()"><i class="fa fa-plus"></i></div>
    </div>  
  `,
  styles : [`.mdl-button{min-width:0px;} `]
})
export class AdvanceQueryEditor implements OnInit {

  @Input() queryModel:AssetSetQueryModel;

  @Output('onHeightChange') heightEmitter: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild ('filterCont', {read: ViewContainerRef}) filterCont:ViewContainerRef;
  @ViewChild ('filterCont') filterContElmRef:ElementRef;

  owners:AssetOwnerModel[] = [];
  fltrCmpRfs:ComponentRef<QueryFilter>[] = [];

  constructor(
    private ownerService: AssetOwnerService,
    private cFR: ComponentFactoryResolver,
  ){}
  ngOnInit(){
      this.ownerService.list().subscribe(owners=>this.owners=owners);
      this.addNewFilter();
  }
  addNewFilter() {
    let qFilter = this.cFR.resolveComponentFactory(QueryFilter);
    var compRef = this.filterCont.createComponent(qFilter);
    this.fltrCmpRfs.push(compRef);
    compRef.instance.closeEmitter.subscribe(()=>{
      this.fltrCmpRfs.splice(this.fltrCmpRfs.indexOf(compRef),1)[0].destroy();
      ((thisObj)=>setTimeout(()=>thisObj.heightEmitter.emit(thisObj.filterContElmRef.nativeElement.parentElement.offsetHeight), 0))(this)
    });
    ((thisObj)=>setTimeout(()=>thisObj.heightEmitter.emit(thisObj.filterContElmRef.nativeElement.parentElement.offsetHeight), 0))(this)
  }
  updateQueryModel() {
    var retArr=[], fObj;
    this.fltrCmpRfs.forEach(compRef=>(fObj=compRef.instance.filterObject) && fObj.validity && retArr.push(fObj.getFilterData()));
    this.queryModel.filters.splice(0,this.queryModel.filters.length);
    this.queryModel.filters.push.apply(this.queryModel.filters, retArr); // need to push all together
  }
  reset() {
    this.fltrCmpRfs.forEach(compRef=>compRef.destroy());
    this.fltrCmpRfs=[];
    this.addNewFilter();
  }
  ngOnDestroy() {
    this.fltrCmpRfs.forEach(compRef=>compRef.destroy());
    this.fltrCmpRfs=[];
  }
}

