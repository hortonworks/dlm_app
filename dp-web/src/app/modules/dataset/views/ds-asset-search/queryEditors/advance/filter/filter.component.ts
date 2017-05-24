import {AssetOwnerModel} from "../../../../../models/assetOwnerModel";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AssetOwnerService} from "../../../../../services/assetOwnerService";
import {
  AssetSetQueryFilterModel, AssetTypeEnum,
  AssetTypeEnumString
} from "../../../../ds-assets-list/ds-assets-list.component";


export enum FilterOperatorEnum {LT, LTEQ, EQ, NOTEQ, GTEQ, GT, LIKE}; //LIKE is contains
export var FilterOperatorSymbols = ["<", "<=", "==", "!=", "=>", ">", "Contains"];

var FOEnum = FilterOperatorEnum;

export class QueryFilterObject {
  propertyName:string="";
  operators:FilterOperatorEnum[] = [];
  selectedOperator:FilterOperatorEnum = -1;
  helpText:string = "";
  _value:(string|number)="";
  valueOptions:any[]=null;
  getValue(){return this._value;}
  getOperatorDisplay (enmVal:FilterOperatorEnum) {return FilterOperatorSymbols[enmVal]}
  validationRegEx = /[^$|\s+]/; //not empty or just whitespace
  validity:boolean = false;
  validate(){
    return this.validity=(this.selectedOperator==-1)?false:(
      (this.valueOptions)?((this._value==-1)?false:true):(
        this.validationRegEx.test(<string>this._value)));
  }
  getFilterData(){
    return <AssetSetQueryFilterModel>{
      column:this.propertyName, value:this.getValue(),
      operator:this.getOperatorDisplay(this.selectedOperator)
    }
  }
}

export class QueryFilterOwner extends QueryFilterObject{
  propertyName:string="asset.owner.id";
  operators:FilterOperatorEnum[] = [FOEnum.EQ, FOEnum.NOTEQ];
  helpText:string = "Select Owner";
  _value:number = -1;
  constructor(public valueOptions:AssetOwnerModel[]){super()}
  getValue(){return this.valueOptions[this._value].id;}
}

export class QueryFilterSource extends QueryFilterObject{
  propertyName:string="asset.source";
  operators:FilterOperatorEnum[] = [FOEnum.EQ, FOEnum.NOTEQ];
  helpText:string = "Select Source";
  _value:number = -1;
  valueOptions:AssetTypeEnum[]=[AssetTypeEnum.HIVE, AssetTypeEnum.HDFS]
  getValue(){return AssetTypeEnumString[this.valueOptions[this._value]];}
}

export class QueryFilterName extends QueryFilterObject{
  propertyName:string="asset.name";
  operators:FilterOperatorEnum[] = [FOEnum.EQ, FOEnum.LIKE];
  helpText:string = "Enter Name";
  _value:string;
}

@Component({
  selector:"query-filter",
  templateUrl : "./filter.component.html",
  styleUrls : ["./filter.component.scss"]
})
export class QueryFilter  implements OnInit {
  @Input() avoidNewLine:boolean=false;
  @Output('onClose') closeEmitter: EventEmitter<null> = new EventEmitter<null>();
  filterObject:QueryFilterObject = null;
  availableFilters:any[]=[
    {display:"Select Filter Type", className:"QueryFilterObject"},
    {display:"Owner", className:"QueryFilterOwner"},
    {display:"Name", className:"QueryFilterName"}
  ];
  owners:AssetOwnerModel[] = [];
  constructor(
    private ownerService: AssetOwnerService
  ){}
  ngOnInit(){
    this.ownerService.list().subscribe(owners=>this.owners=owners)
  }
  onFilterTypeChange(e){
    switch(this.availableFilters[e.target.value].className) {
      case "QueryFilterOwner" : this.filterObject = new QueryFilterOwner(this.owners);  break;
      case "QueryFilterName"  : this.filterObject = new QueryFilterName();              break;
      default                 : this.filterObject = new QueryFilterObject();            break;
    }
  }
  validate(){this.filterObject.validate();}
  onCloseClick(){this.closeEmitter.emit()}
}
