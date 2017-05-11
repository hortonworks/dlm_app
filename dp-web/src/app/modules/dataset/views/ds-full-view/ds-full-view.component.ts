import {Component, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetService} from "../../services/RichDatasetService";
import {AssetListActionsEnum} from "../ds-assets-list/ds-assets-list.component";


@Component({
  selector: 'dp-ds-full-view',
  templateUrl: './ds-full-view.component.html',
  styleUrls: ['./ds-full-view.component.scss'],
})
export class DsFullView implements OnInit {

  public dsModel :RichDatasetModel = null;
  public applicableListActions:AssetListActionsEnum[] = [AssetListActionsEnum.EDIT];

  constructor(
    private richDatasetService :RichDatasetService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ){}

  ngOnInit () {
    this.activeRoute.params.subscribe(params => this.richDatasetService.getById(+params['id']).subscribe(dsObj => this.dsModel=dsObj));
  }
  onEdit(action:AssetListActionsEnum) {
    this.router.navigate(['dataset/edit/'+this.dsModel.id]);
  }

}
