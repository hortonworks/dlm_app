import {
  Component, ComponentFactoryResolver, ComponentRef, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,
  ViewContainerRef
} from "@angular/core";
import {AssetOwnerModel} from "../../../../models/assetOwnerModel";
import {AssetOwnerService} from "../../../../services/assetOwnerService";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../../../ds-assets-list/ds-assets-list.component";
import {QueryFilter} from "./filter/filter.component";

@Component({
  selector: "advance-query-editor",
  styles: [`.mdl-button {  min-width: 0px;  margin-top: 1px;  }`],
  template: `
    <div>
      <span #filterCont></span>
      <button class="mdl-button btn-hwx-secondary" (click)="addNewFilter()"><i class="fa fa-plus"></i></button>
    </div>
  `
})
export class AdvanceQueryEditor implements OnInit {

  @Input() queryModel: AssetSetQueryModel;
  @Input() clusterId:number;

  @Output("onHeightChange") heightEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output("onActionDone") doneEmitter: EventEmitter<null> = new EventEmitter<null>();
  @ViewChild("filterCont", {read: ViewContainerRef}) filterCont: ViewContainerRef;
  @ViewChild("filterCont") filterContElmRef: ElementRef;

  owners: AssetOwnerModel[] = [];
  fltrCmpRfs: ComponentRef<QueryFilter>[] = [];

  constructor(private ownerService: AssetOwnerService,
              private cFR: ComponentFactoryResolver,) {
  }

  ngOnInit() {
    this.ownerService.list().subscribe(owners => this.owners = owners);
    this.addNewFilter();
  }

  addNewFilter() {
    const qFilter = this.cFR.resolveComponentFactory(QueryFilter);
    const compRef = this.filterCont.createComponent(qFilter);
    this.fltrCmpRfs.push(compRef);
    compRef.instance.clusterId = this.clusterId;
    compRef.instance.closeEmitter.subscribe(() => {
      this.fltrCmpRfs.splice(this.fltrCmpRfs.indexOf(compRef), 1)[0].destroy();
      setTimeout(() => this.heightEmitter.emit(this.filterContElmRef.nativeElement.parentElement.offsetHeight), 0);
    });
    compRef.instance.enterEmitter.subscribe(() => this.doneEmitter.emit());
    setTimeout(() => this.heightEmitter.emit(this.filterContElmRef.nativeElement.parentElement.offsetHeight), 0);
  }

  updateQueryModel() {
    const retArr = [];
    let fObj;
    this.fltrCmpRfs.forEach(compRef => (fObj = compRef.instance.filterObject) && fObj.validity && retArr.push(fObj.getFilterData()));
    this.queryModel.filters.splice(0, this.queryModel.filters.length);
    this.queryModel.filters.push.apply(this.queryModel.filters, retArr); // need to push all together
  }

  reset() {
    this.fltrCmpRfs.forEach(compRef => compRef.destroy());
    this.fltrCmpRfs = [];
    this.addNewFilter();
  }

  ngOnDestroy() {
    this.fltrCmpRfs.forEach(compRef => compRef.destroy());
    this.fltrCmpRfs = [];
  }
}
