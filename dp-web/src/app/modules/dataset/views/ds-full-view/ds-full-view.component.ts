import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {
  AssetListActionsEnum,
  AssetSetQueryFilterModel,
  AssetSetQueryModel
} from "../ds-assets-list/ds-assets-list.component";

@Component({
  selector: "ds-full-view",
  styleUrls: ["./ds-full-view.component.scss"],
  templateUrl: "./ds-full-view.component.html",
})
export class DsFullView implements OnInit {

  dsModel: RichDatasetModel = null;
  applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.EDIT];
  dsAssetQueryModel: AssetSetQueryModel;

  constructor(private richDatasetService: RichDatasetService,
              private router: Router,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params
      .subscribe(params => {
        this.richDatasetService
          .getById(+params["id"])
          .subscribe(dsObj => this.dsModel = dsObj);
        this.dsAssetQueryModel = new AssetSetQueryModel([
          new AssetSetQueryFilterModel("dataset.id", "=", +params["id"], "-")
        ]);
      });
  }

  private onEdit(action: AssetListActionsEnum) {
    this.router.navigate([`datasteward/datafolio/edit/${this.dsModel.id}`]);
  }

}
