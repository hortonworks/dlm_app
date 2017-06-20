import {Component, EventEmitter, Input, OnInit, Output, SimpleChange} from "@angular/core";
import {DatasetTag} from "../../../../../models/dataset-tag";
import {DatasetTagService} from "../../../../../services/tag.service";

@Component({
  selector: "nav-tag-panel",
  styleUrls: ["./nav-tag-panel.component.scss"],
  templateUrl: "./nav-tag-panel.component.html"
})
export class NavTagPanel implements OnInit {

  @Input() dsNameSearch:string = "";
  @Output("updateSelection") updateSelectionEmitter: EventEmitter<DatasetTag> = new EventEmitter<DatasetTag>();
  allTags: DatasetTag[] = null;
  displayTags: DatasetTag[] = null;
  tagSearchText: string = "";
  private currentDsTag: DatasetTag = null;

  constructor(private tagService: DatasetTagService) {
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    changes["dsNameSearch"] && !changes["dsNameSearch"].firstChange && this.fetchList();
  }

  ngOnInit() {
    this.fetchList();
  }

  fetchList() {
    this.tagService.list(this.dsNameSearch).subscribe(tags => {
      this.currentDsTag && (this.currentDsTag = tags.filter(tag=>tag.name==this.currentDsTag.name)[0]);
      (this.displayTags = this.allTags = tags) && tags.length && this.onPanelRowSelectionChange(this.currentDsTag || tags[0]);
    });
  }

  onPanelRowSelectionChange(tagObj: DatasetTag) {
    this.currentDsTag = tagObj;
    this.updateSelectionEmitter.emit(tagObj);
  }

  searchTag() {
    this.displayTags = this.allTags.filter(tag => tag.name.toLowerCase().indexOf(this.tagSearchText.toLowerCase()) != -1);
  }
}
