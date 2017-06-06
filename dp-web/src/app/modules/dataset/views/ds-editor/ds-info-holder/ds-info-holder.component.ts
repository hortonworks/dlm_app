import {Component, Input, OnInit, SimpleChange} from "@angular/core";
import {Lake} from "../../../../../models/lake";
import {LakeService} from "../../../../../services/lake.service";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {DsTagsService} from "../../../services/dsTagsService";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-info-holder",
  styleUrls: ["./ds-info-holder.component.scss"],
  templateUrl: "./ds-info-holder.component.html"
})
export class DsInfoHolder implements OnInit {

  @Input() dsModel: RichDatasetModel;
  @Input() tags: string[] = [];
  availableTags = [];
  lakes: Lake[];

  constructor(private lakeService: LakeService,
              private tagService: DsTagsService) {
  }

  ngOnInit() {
//    this.lakeService.list().subscribe(lakes => this.lakes=lakes);
    (thisObj => setTimeout(() => thisObj.lakes = tmpLakes, 100))(this);
  }

  onTagSearchChange(text: string) {
    this.tagService.list(text, 5).subscribe(tags => this.availableTags = tags);
  }

  onNewTagAddition(text: string) {
    this.tags.push(text);
  }

  onLakeSelectionChange() {
    this.dsModel.datalakeName = this.lakes.filter(lake => lake.id == this.dsModel.datalakeId)[0].name;
  }

}

const tmpLakes: Lake[] = [
  {id: 1, name: "Lake-1", description: "Some Description", location: 0, ambariUrl: "some ambariUrl"},
  {id: 2, name: "Lake-2", description: "Some Description", location: 0, ambariUrl: "some ambariUrl"},
  {id: 3, name: "Lake-3", description: "Some Description", location: 0, ambariUrl: "some ambariUrl"},
  {id: 4, name: "Lake-4", description: "Some Description", location: 0, ambariUrl: "some ambariUrl"},
  {id: 5, name: "Lake-5", description: "Some Description", location: 0, ambariUrl: "some ambariUrl"}
];
