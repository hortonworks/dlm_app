import {Component, EventEmitter, Input, OnInit, Output, SimpleChange} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {
  AssetListActionsEnum, AssetSetQueryFilterModel,
  AssetSetQueryModel
} from "../../ds-assets-list/ds-assets-list.component";


@Component({
  selector: 'ds-assets-holder',
  templateUrl: './ds-assets-holder.component.html',
  styleUrls: ['./ds-assets-holder.component.scss'],
  providers: [RichDatasetModel]
})

export class DsAssetsHolder implements OnInit {

  @Input() assetSetQueryModelsForAddition: AssetSetQueryModel[] = null;
  @Input() assetSetQueryModelsForSubtraction: AssetSetQueryModel[] = null;

  @Input() dsModel: RichDatasetModel = null;
  public applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.ADD, AssetListActionsEnum.REMOVE];

  @Output('onDoneAction') actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  public showPopup: boolean = false;
  public showList: boolean = false;

  ngOnInit() {
    this.setShowListFlag()
  }

  setShowListFlag() {
    this.showList = (this.assetSetQueryModelsForAddition.length > 0);
  }

  actionDone(asqm: AssetSetQueryModel) {
    this.assetSetQueryModelsForAddition.push(asqm);
    this.actionEmitter.emit()
    this.showPopup = false;
    this.setShowListFlag();
  }

  onListAction(action: AssetListActionsEnum) {
    if (action == AssetListActionsEnum.ADD) this.showPopup = true;
    if (action == AssetListActionsEnum.REMOVE) this.actionRemoveAll();
  }

  actionRemoveAll() {
    this.assetSetQueryModelsForAddition.splice(0);
    this.setShowListFlag();
    this.actionEmitter.emit();
  }

  actionCancel() {
    this.showPopup = false;
  }
}
