import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DatasetTag} from "../../../../../models/dataset-tag";
import {DatasetTagService} from "../../../../../services/tag.service";

@Component({
  selector: "nav-tag-panel",
  styleUrls: ["./nav-tag-panel.component.scss"],
  templateUrl: "./nav-tag-panel.component.html"
})
export class NavTagPanel implements OnInit {

  @Output("updateSelection") updateSelectionEmitter: EventEmitter<DatasetTag> = new EventEmitter<DatasetTag>();
  allTags: DatasetTag[] = null;
  displayTags: DatasetTag[] = null;
  tagSearchText: string = "";
  private currentDsTag: DatasetTag = null;

  constructor(private tagService: DatasetTagService) {
  }

  ngOnInit() {
    this.tagService.list().subscribe(tags =>
    (this.displayTags = this.allTags = tags) && tags.length && this.onPanelRowSelectionChange(tags[0]));
  }

  onPanelRowSelectionChange(tagObj: DatasetTag) {
    this.currentDsTag = tagObj;
    this.updateSelectionEmitter.emit(tagObj);
  }

  searchTag() {
    this.displayTags = this.allTags.filter(tag => tag.name.toLowerCase().indexOf(this.tagSearchText.toLowerCase()) != -1);
  }
}
