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
  public allTags :DatasetTag[] = null;
  public displayTags :DatasetTag[] = null;
  private currentDsTag :DatasetTag = null;
  public tagSearchText:string="";

  constructor(
    private tagService :DatasetTagService
  ){}

  ngOnInit () {
    this.tagService.list().subscribe(tags => (this.displayTags=this.allTags=tags) && tags.length && this.onPanelRowSelectionChange(tags[0]));
  }

  onPanelRowSelectionChange (tagObj:DatasetTag) {
      this.currentDsTag = tagObj;
      this.updateSelectionEmitter.emit(tagObj);
  }

  searchTag(){
    this.displayTags=this.allTags.filter(tag=>tag.name.toLowerCase().indexOf(this.tagSearchText.toLowerCase()) != -1);
  }
}
