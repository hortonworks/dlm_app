import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsTagsService} from "../../services/dsTagsService";
import {RichDatasetService} from "../../services/RichDatasetService";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../ds-assets-list/ds-assets-list.component";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-editor",
  styleUrls: ["./ds-editor.component.scss"],
  templateUrl: "./ds-editor.component.html"
})
export class DsEditor implements OnInit {

  currentStage: number = 1;
  nextIsVisible: boolean = true;
  tags: string[] = [];
  assetSetQueryModelsForAddition: AssetSetQueryModel[] = [];
  assetSetQueryModelsForSubtraction: AssetSetQueryModel[] = [];
  private datasetId: number = null;

  constructor(public dsModel: RichDatasetModel,
              private richDatasetService: RichDatasetService,
              private tagService: DsTagsService,
              private router: Router,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => this.datasetId = +params["id"]);
    if (isNaN(this.datasetId)) {
      this.router.navigate(["dataset/add"]);
    }
    else {
      this.assetSetQueryModelsForAddition.push(
        new AssetSetQueryModel([new AssetSetQueryFilterModel("dataset.id", "=", this.datasetId, "-")])
      );
      this.richDatasetService.getById(this.datasetId)
        .subscribe(dsModel => {
          this.dsModel = dsModel;
          this.tagService.listDatasetTags(this.dsModel.id).subscribe(tags => this.tags = tags);
        });
    }
  }

  setVisibilityOfNext() {
    this.nextIsVisible = (this.currentStage == 1 || this.currentStage == 2 && this.assetSetQueryModelsForAddition.length != 0);
  }

  actionNext() {
    if (!this[`validateStage${this.currentStage}`]()) {
      return;
    }
    ++this.currentStage;
    this.setVisibilityOfNext();
  }

  moveToStage(newStage: number) {
    if ((newStage < this.currentStage) && (this.currentStage = newStage)) {
      this.setVisibilityOfNext();
    }
  }

  actionSave() {
    this.actionCancel();
  }

  actionCancel() {
    this.router.navigate(["dataset"]);
  }

  validateStage1() {
    return this.dsModel.name && this.dsModel.description && this.dsModel.datalakeId;
  }

  validateStage2() {
    return true;
  }

  validateStage3() {
    return true;
  }

}
