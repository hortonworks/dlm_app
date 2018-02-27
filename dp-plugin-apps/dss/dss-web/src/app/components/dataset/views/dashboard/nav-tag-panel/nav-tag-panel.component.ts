/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
  @Input() bookmarkFilter:string = "";
  @Output("updateSelection") updateSelectionEmitter: EventEmitter<DatasetTag> = new EventEmitter<DatasetTag>();
  allTags: DatasetTag[] = null;
  displayTags: DatasetTag[] = null;
  tagSearchText: string = "";
  private currentDsTag: DatasetTag = null;

  constructor(private tagService: DatasetTagService) {
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if ((changes["dsNameSearch"] && !changes["dsNameSearch"].firstChange) || (changes["bookmarkFilter"])) {
      this.fetchList();
    }
  }

  ngOnInit() {
    this.fetchList();
  }

  fetchList() {
    this.tagService
      .list(this.dsNameSearch, this.bookmarkFilter)
      .map(tags => tags.filter(cTag => cTag.name === 'ALL' || cTag.count > 0))
      .subscribe(tags => {
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

  onClearSearch(){
    this.tagSearchText = "";
    this.searchTag();
  }
}
