import {Component, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetService} from "../../services/RichDatasetService";


@Component({
  selector: 'dp-ds-full-view',
  templateUrl: './ds-full-view.component.html',
  styleUrls: ['./ds-full-view.component.scss'],
})
export class DsFullView implements OnInit {

  public dsModel :RichDatasetModel = null;

  constructor(
    private richDatasetService :RichDatasetService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ){}

  ngOnInit () {
    this.activeRoute.params.subscribe(params => this.richDatasetService.getById(+params['id']).subscribe(dsObj => this.dsModel=dsObj));
  }

}
