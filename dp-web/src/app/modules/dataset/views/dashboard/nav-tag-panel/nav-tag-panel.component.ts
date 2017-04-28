import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DatasetTagService} from "../../../../../services/tag.service";
import {DatasetTag} from "../../../../../models/dataset-tag";

@Component({
  selector: 'nav-tag-panel',
  templateUrl: './nav-tag-panel.component.html',
  styleUrls: ['./nav-tag-panel.component.scss'],
})
export class NavTagPanel implements OnInit {

  @Output ('updateSelection') updateSelectionEmitter: EventEmitter<DatasetTag> = new EventEmitter<DatasetTag>();
  public dsTags :DatasetTag[] = null;
  private currentDsTag :DatasetTag = null;
  constructor(
    private tagService :DatasetTagService
  ){}
  ngOnInit () {
    console.log("ngOnInit called");
    this.tagService.list().subscribe(tags => (this.dsTags=tags) && tags.length && this.onPanelRowSelectionChange(tags[0]));
  }
  onPanelRowSelectionChange (tagObj:DatasetTag) {
      this.currentDsTag = tagObj;
      this.updateSelectionEmitter.emit(tagObj);
  }
}
