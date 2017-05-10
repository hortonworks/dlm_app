import {Component, Input, OnInit, SimpleChange} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {LakeService} from "../../../../../services/lake.service";
import {Lake} from "../../../../../models/lake";
import {DsTagsService} from "../../../services/dsTagsService";

@Component({
  selector: 'ds-info-holder',
  templateUrl: './ds-info-holder.component.html',
  styleUrls: ['./ds-info-holder.component.scss'],
  providers:[RichDatasetModel]
})
export class DsInfoHolder implements OnInit {

  @Input() dsModel: RichDatasetModel;
  @Input() tags:string[] = [];
  availableTags = [];
  private lakes:Lake[];

  constructor (
    private lakeService: LakeService,
    private tagService: DsTagsService
  ) {}
  ngOnInit() {
    this.lakeService.list().subscribe(lakes => this.lakes=lakes);
  }
  onTagSearchChange(text:string) {
    this.tagService.list(text,5).subscribe(tags => this.availableTags=tags);
  }
  onNewTagAddition(text:string){
    this.tags.push(text);
  }

  // ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
  //   if (changes['dsModel'] && this.dsModel) {
  //   }
  // }

}
