import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {LakeService} from "../../../../../services/lake.service";
import {Lake} from "../../../../../models/lake";

@Component({
  selector: 'ds-info-holder',
  templateUrl: './ds-info-holder.component.html',
  styleUrls: ['./ds-info-holder.component.scss'],
  providers:[RichDatasetModel]
})
export class DsInfoHolder implements OnInit {

  @Input() dsModel: RichDatasetModel;
  private lakes:Lake[];

  constructor (
    private lakeService: LakeService,
  ) {}
  ngOnInit() {
    this.lakeService.list().subscribe(lakes => this.lakes=lakes);
  }
}
